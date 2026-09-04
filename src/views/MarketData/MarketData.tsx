import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import marketDataApi from "@/api/marketDataApi"
import aiApi from "@/api/aiApi"
import { Panel, SectionLabel, Delta, Btn, PageHead } from "@/components/glass/Glass"
import { CandleChart, Candle } from "@/components/glass/Charts"
import Icon from "@/components/glass/Icon"

const usd = (v: number | null | undefined, d = 2) => v == null ? "—" : "$" + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })

/* Normalize whatever getTimeSeriesDaily returns into Candle[].
   Accepts: array of {time,open,high,low,close} (lightweight-charts form),
   or AlphaVantage object { "Time Series (Daily)": { date: {"1. open":…} } },
   or a flat date-keyed object. */
function normalize(raw: any): Candle[] {
  if (!raw) return []
  let rows: any[] = []
  if (Array.isArray(raw)) {
    rows = raw.map((d) => ({
      o: +(d.open ?? d.o), h: +(d.high ?? d.h), l: +(d.low ?? d.l), c: +(d.close ?? d.c),
      v: d.volume != null ? +d.volume : undefined, t: d.time ?? d.date,
    }))
  } else {
    const series = raw["Time Series (Daily)"] || raw
    if (typeof series !== "object") return []
    rows = Object.entries(series).map(([date, v]: [string, any]) => ({
      t: date,
      o: +(v["1. open"] ?? v.open), h: +(v["2. high"] ?? v.high),
      l: +(v["3. low"] ?? v.low), c: +(v["4. close"] ?? v.close),
      v: v["6. volume"] != null ? +v["6. volume"] : (v.volume != null ? +v.volume : undefined),
    }))
  }
  return rows.filter((r) => !isNaN(r.c)).sort((a, b) => String(a.t).localeCompare(String(b.t)))
    .map(({ o, h, l, c, v }) => ({ o, h, l, c, v }))
}

function AskPanel({ symbol }: { symbol: string }) {
  const [msgs, setMsgs] = useState<{ role: "ai" | "user"; text?: string; typing?: boolean }[]>([
    { role: "ai", text: `Ask me about ${symbol}'s price action, levels, or what's driving the move.` },
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  async function send(q?: string) {
    const text = (q ?? input).trim()
    if (!text || busy) return
    setInput(""); setBusy(true)
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", typing: true }])
    const data = await aiApi.askClaude(`You are a markets assistant. The user is viewing ${symbol}. Answer in 2-4 sentences. Question: ${text}`)
    const answer = typeof data === "string" ? data : ((data as any)?.response || (data as any)?.message || (data as any)?.content || (data as any)?.text || JSON.stringify(data))
    setMsgs((m) => { const c = m.filter((x) => !x.typing); c.push({ role: "ai", text: answer }); return c })
    setBusy(false)
  }
  return (
    <Panel style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ display: "flex", color: "var(--accent)" }}><Icon name="sparkles" size={16} /></span>
        <SectionLabel style={{ marginBottom: 0 }}>Ask FinAI</SectionLabel>
      </div>
      <div className="gg-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, minHeight: 180, marginBottom: 12 }}>
        {msgs.map((m, i) => m.typing
          ? <div key={i} className="ai-bubble ai"><span className="fin-dots"><i /><i /><i /></span></div>
          : <div key={i} className={`ai-bubble ${m.role}`}>{m.text}</div>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Ask about ${symbol}…`} className="fin-input" style={{ flex: 1 }} disabled={busy} />
        <Btn kind="primary" icon="arrow-up" onClick={() => send()} disabled={busy} style={{ width: 42, padding: 0, justifyContent: "center" }} />
      </div>
    </Panel>
  )
}

export default function MarketData() {
  const { symbol = "" } = useParams()
  const navigate = useNavigate()
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(90)

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    marketDataApi.getTimeSeriesDaily(symbol).then((data) => { setCandles(normalize(data)); setLoading(false) })
  }, [symbol])

  const view = candles.slice(-range)
  const last = view.length ? view[view.length - 1].c : null
  const prev = view.length > 1 ? view[view.length - 2].c : null
  const chg = last != null && prev != null ? last - prev : null
  const chgPct = chg != null && prev ? (chg / prev) * 100 : null
  const hi = view.length ? Math.max(...view.map((c) => c.h)) : null
  const lo = view.length ? Math.min(...view.map((c) => c.l)) : null

  if (!symbol) return (
    <Panel style={{ textAlign: "center", padding: 60 }}>
      <p className="lead">Search a ticker to view its chart.</p>
    </Panel>
  )

  return (
    <div>
      <PageHead title={symbol} subtitle="Daily price action and an AI read on the move.">
        <Btn icon="file-search" kind="ghost" onClick={() => navigate(`/research/${symbol}`)}>Full research</Btn>
        <Btn icon="plus" kind="primary" onClick={() => navigate("/portfolio")}>Trade</Btn>
      </PageHead>

      {/* stats strip */}
      <Panel style={{ marginBottom: 18 }}>
        <div className="kpi-grid">
          <div><SectionLabel>Last</SectionLabel><div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", marginTop: 4 }}>{usd(last)}</div></div>
          <div><SectionLabel>Change</SectionLabel><div style={{ marginTop: 8 }}>{chgPct != null ? <Delta value={chgPct} pct d={2} suffix={chg != null ? ` (${chg >= 0 ? "+" : ""}${chg.toFixed(2)})` : ""} /> : "—"}</div></div>
          <div><SectionLabel>Range high · {range}d</SectionLabel><div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4, color: "var(--up)" }}>{usd(hi)}</div></div>
          <div><SectionLabel>Range low · {range}d</SectionLabel><div style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4, color: "var(--down)" }}>{usd(lo)}</div></div>
        </div>
      </Panel>

      <div className="research-top">
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SectionLabel style={{ marginBottom: 0 }}>Price · {view.length} sessions</SectionLabel>
            <div style={{ display: "flex", gap: 2, background: "color-mix(in oklch, var(--foreground) 4%, transparent)", borderRadius: 99, padding: 3 }}>
              {[{ l: "1M", n: 22 }, { l: "3M", n: 66 }, { l: "6M", n: 132 }, { l: "1Y", n: 252 }].map((r) => (
                <button key={r.l} onClick={() => setRange(r.n)} className="gg-transition"
                  style={{ height: 26, padding: "0 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                    cursor: "pointer", border: "none", color: range === r.n ? "var(--accent-foreground)" : "var(--muted-foreground)",
                    background: range === r.n ? "var(--accent)" : "transparent" }}>{r.l}</button>
              ))}
            </div>
          </div>
          {loading ? <div style={{ padding: 80, textAlign: "center", color: "var(--muted-foreground)" }}>Loading {symbol}…</div>
            : view.length > 1 ? <CandleChart candles={view} height={320} />
            : <div style={{ padding: 80, textAlign: "center", color: "var(--muted-foreground)" }}>No price history available for {symbol}.</div>}
        </Panel>
        <AskPanel symbol={symbol} />
      </div>
    </div>
  )
}
