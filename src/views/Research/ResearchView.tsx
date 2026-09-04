import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import researchApi, { ResearchProfile, Financials } from "@/api/researchApi"
import marketDataApi from "@/api/marketDataApi"
import aiApi from "@/api/aiApi"
import { Panel, SectionLabel, Delta, Btn, fmtB } from "@/components/glass/Glass"
import { CandleChart, EpsBars, FactorBar, Candle } from "@/components/glass/Charts"
import Icon from "@/components/glass/Icon"

const grade = (g: string) => ({ A: "var(--chart-3)", B: "var(--chart-1)", C: "var(--chart-4)", D: "var(--chart-5)", F: "var(--chart-5)" } as any)[(g || "").trim().charAt(0)] || "var(--muted-foreground)"
const num = (v: number | null | undefined, d = 2) => v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: d })
const pct = (v: number | null | undefined, d = 1) => v == null ? "—" : (v * 100).toFixed(d) + "%"
const usd = (v: number | null | undefined, d = 2) => v == null ? "—" : "$" + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })

function MetricPair({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 14 }}>{v}</span>
    </div>
  )
}
function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
      <span style={{ width: 76, fontSize: 13, color: "var(--muted-foreground)" }}>{label}</span>
      <div style={{ flex: 1 }}><FactorBar value={value} width={1000} showNum={false} /></div>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 13, width: 26, textAlign: "right" }}>{Math.round(value)}</span>
    </div>
  )
}

function extractAiText(data: any): string {
  if (data == null) return "No response."
  if (typeof data === "string") return data
  if (Array.isArray(data)) return data.map(extractAiText).join(" ")
  return data.response || data.message || data.content || data.text || data.answer || JSON.stringify(data)
}

function AskAI({ symbol, name }: { symbol: string; name: string }) {
  const [msgs, setMsgs] = useState<{ role: "ai" | "user"; text?: string; typing?: boolean }[]>([
    { role: "ai", text: `Ask me anything about ${symbol} — fundamentals, the factor scores, recent catalysts, or how it fits your book.` },
  ])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const suggest = [`Why is ${symbol}'s quant score where it is?`, "What are the key risks?"]

  async function send(q?: string) {
    const text = (q ?? input).trim()
    if (!text || busy) return
    setInput(""); setBusy(true)
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", typing: true }])
    const prompt = `You are an equity research assistant. The user is viewing ${name} (${symbol}). Answer concisely in 2-4 sentences. Question: ${text}`
    const data = await aiApi.askClaude(prompt)
    const answer = extractAiText(data)
    setMsgs((m) => { const c = m.filter((x) => !x.typing); c.push({ role: "ai", text: answer }); return c })
    setBusy(false)
  }

  return (
    <Panel style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ display: "flex", color: "var(--accent)" }}><Icon name="sparkles" size={16} /></span>
        <SectionLabel style={{ marginBottom: 0 }}>Ask FinAI</SectionLabel>
      </div>
      <div className="gg-scroll" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, minHeight: 200, marginBottom: 12 }}>
        {msgs.map((m, i) => m.typing
          ? <div key={i} className="ai-bubble ai"><span className="fin-dots"><i /><i /><i /></span></div>
          : <div key={i} className={`ai-bubble ${m.role}`}>{m.text}</div>)}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {suggest.map((s) => <button key={s} onClick={() => send(s)} className="suggest-chip" disabled={busy}>{s}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={`Ask about ${symbol}…`} className="fin-input" style={{ flex: 1 }} disabled={busy} />
        <Btn kind="primary" icon="arrow-up" onClick={() => send()} disabled={busy} style={{ width: 42, padding: 0, justifyContent: "center" }} />
      </div>
    </Panel>
  )
}

export default function ResearchView() {
  const { symbol = "" } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ResearchProfile | null>(null)
  const [candles, setCandles] = useState<Candle[]>([])
  const [price, setPrice] = useState<{ last: number; chg: number; chgPct: number } | null>(null)
  const [financials, setFinancials] = useState<Financials | null>(null)
  const [tab, setTab] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true); setProfile(null); setCandles([]); setPrice(null); setFinancials(null)
    researchApi.getProfile(symbol).then((p) => { setProfile(p); setLoading(false) })
    marketDataApi.getTimeSeriesDaily(symbol).then((ts: any) => {
      let rows: { t: string; o: number; h: number; l: number; c: number }[] = []
      if (Array.isArray(ts)) {
        rows = ts.map((d: any, i: number) => ({
          t: String(d.time ?? d.date ?? i),
          o: +(d.open ?? d.o), h: +(d.high ?? d.h), l: +(d.low ?? d.l), c: +(d.close ?? d.c),
        }))
      } else {
        const series = ts && ts["Time Series (Daily)"] ? ts["Time Series (Daily)"] : ts
        if (!series || typeof series !== "object") return
        rows = Object.entries(series).map(([date, v]: [string, any]) => ({
          t: date,
          o: +(v["1. open"] ?? v.open), h: +(v["2. high"] ?? v.high),
          l: +(v["3. low"] ?? v.low), c: +(v["4. close"] ?? v.close),
        })).sort((a, b) => a.t.localeCompare(b.t))
      }
      rows = rows.filter((r) => !isNaN(r.c))
      const tail = rows.slice(-90)
      setCandles(tail.map(({ o, h, l, c }) => ({ o, h, l, c })))
      if (tail.length > 1) {
        const last = tail[tail.length - 1].c, prev = tail[tail.length - 2].c
        setPrice({ last, chg: last - prev, chgPct: ((last - prev) / prev) * 100 })
      }
    })
  }, [symbol])

  useEffect(() => { if (tab === "financials" && !financials) researchApi.getFinancials(symbol).then(setFinancials) }, [tab])

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "var(--muted-foreground)" }}>Loading {symbol}…</div>
  if (!profile) return (
    <Panel style={{ textAlign: "center", padding: 60 }}>
      <p className="lead">No research profile found for <b style={{ fontFamily: "var(--font-mono)" }}>{symbol}</b>.</p>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}><Btn kind="primary" onClick={() => navigate("/screener")}>Back to screener</Btn></div>
    </Panel>
  )

  const f = profile.fundamentals
  const q = profile.quantScore
  const a = profile.analystRatings
  const g = q.grade || "—"
  const metrics: [string, string][] = [
    ["P/E (TTM)", num(f.trailingPE ?? f.pe)], ["Forward P/E", num(f.forwardPE)], ["PEG", num(f.peg)],
    ["P/B", num(f.pb)], ["P/S", num(f.ps)], ["EV/EBITDA", num(f.evToEBITDA)],
    ["EPS (TTM)", usd(f.eps)], ["Market Cap", fmtB(f.marketCap)], ["Revenue TTM", fmtB(f.revenueTTM)],
    ["EBITDA", fmtB(f.ebitda)], ["Profit Margin", pct(f.profitMargin)], ["Op. Margin", pct(f.operatingMargin)],
    ["ROE", pct(f.roe)], ["ROA", pct(f.roa)], ["Beta", num(f.beta)], ["Div. Yield", pct(f.dividendYield)],
    ["52-Wk High", usd(f.week52High)], ["52-Wk Low", usd(f.week52Low)], ["50-Day MA", usd(f.ma50)],
    ["200-Day MA", usd(f.ma200)], ["Target Price", usd(f.analystTargetPrice)], ["Earnings Growth", pct(f.earningsGrowthYOY)],
  ]
  const ratingBars: [string, number, string][] = [
    ["Strong Buy", a.strongBuy ?? 0, "var(--chart-3)"], ["Buy", a.buy ?? 0, "var(--chart-2)"],
    ["Hold", a.hold ?? 0, "var(--chart-4)"], ["Sell", a.sell ?? 0, "var(--chart-5)"], ["Strong Sell", a.strongSell ?? 0, "var(--chart-5)"],
  ]
  const totalRatings = ratingBars.reduce((s, b) => s + b[1], 0)
  const epsHist = profile.earningsHistory.filter((e) => e.reportedEPS != null).slice(-8).map((e) => ({ date: e.date, eps: e.reportedEPS as number }))
  const sentPos = profile.sentiment.score >= 0

  return (
    <div>
      <Panel style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: grade(g), display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{g.charAt(0)}</span>
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.1em", opacity: 0.9 }}>QUANT</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{profile.symbol}</span>
              <span style={{ fontSize: 15, color: "var(--muted-foreground)" }}>{profile.name}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 3 }}>{profile.sector} · {profile.industry} · {profile.exchange}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{price ? usd(price.last) : "—"}</div>
            {price && <Delta value={price.chgPct} pct d={2} suffix={` (${price.chg >= 0 ? "+" : ""}${price.chg.toFixed(2)})`} />}
          </div>
          <Btn kind="accentGhost" icon="plus" onClick={() => navigate("/portfolio")}>Trade</Btn>
        </div>
      </Panel>

      <div className="research-top" style={{ marginBottom: 18 }}>
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <SectionLabel style={{ marginBottom: 12 }}>Price · {candles.length} sessions</SectionLabel>
          {candles.length > 1
            ? <CandleChart candles={candles} height={300} />
            : <div style={{ padding: 60, textAlign: "center", color: "var(--muted-foreground)" }}>No price history available.</div>}
        </Panel>
        <AskAI symbol={profile.symbol} name={profile.name} />
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "1px solid var(--border)" }}>
        {["overview", "financials", "earnings", "insiders"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className="gg-transition"
            style={{ padding: "10px 16px", fontSize: 13.5, fontWeight: 600, textTransform: "capitalize", cursor: "pointer",
              background: "none", border: "none", color: tab === t ? "var(--accent)" : "var(--muted-foreground)",
              borderBottom: "2px solid", borderBottomColor: tab === t ? "var(--accent)" : "transparent", marginBottom: -1 }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="research-grid">
          <Panel>
            <SectionLabel style={{ marginBottom: 8 }}>Key metrics</SectionLabel>
            <div className="metrics-grid">{metrics.map(([k, v]) => <MetricPair key={k} k={k} v={v} />)}</div>
          </Panel>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Panel>
              <SectionLabel style={{ marginBottom: 14 }}>Quant factor scores</SectionLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, fontWeight: 800, fontFamily: "var(--font-mono)", color: grade(g), lineHeight: 1 }}>{Math.round(q.composite)}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>Composite · Grade {g.charAt(0)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <ScoreRow label="Value" value={q.value} />
                  <ScoreRow label="Momentum" value={q.momentum} />
                  <ScoreRow label="Quality" value={q.quality} />
                  <ScoreRow label="Analyst" value={q.analyst} />
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--muted-foreground)", lineHeight: 1.5 }}>Grinold-Kahn IC-weighted factor model. Percentile rank across the active universe.</p>
            </Panel>

            <div className="research-pair">
              <Panel>
                <SectionLabel style={{ marginBottom: 12 }}>Analyst ratings</SectionLabel>
                {ratingBars.map(([label, count, color]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <span style={{ width: 74, fontSize: 11.5, color: "var(--muted-foreground)" }}>{label}</span>
                    <div style={{ flex: 1, height: 6, borderRadius: 99, background: "var(--muted)", overflow: "hidden" }}>
                      <div style={{ width: `${totalRatings ? (count / totalRatings) * 100 : 0}%`, height: "100%", background: color }} />
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, width: 16, textAlign: "right" }}>{count}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--up)", fontWeight: 600 }}>{a.consensus || "—"}</span>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Target <b style={{ color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>{usd(f.analystTargetPrice)}</b></span>
                </div>
              </Panel>

              <Panel>
                <SectionLabel style={{ marginBottom: 12 }}>News sentiment</SectionLabel>
                <div style={{ textAlign: "center", padding: "8px 0" }}>
                  <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "var(--font-mono)", color: sentPos ? "var(--up)" : "var(--down)" }}>
                    {sentPos ? "+" : ""}{profile.sentiment.score.toFixed(3)}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: sentPos ? "var(--up)" : "var(--down)", marginTop: 2 }}>{profile.sentiment.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 8 }}>{profile.sentiment.articles} recent articles analysed</div>
                </div>
                <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <SectionLabel style={{ marginBottom: 8 }}>Ownership</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                    <MetricPair k="Insider %" v={pct(f.percentInsiders)} />
                    <MetricPair k="Institution %" v={pct(f.percentInstitutions)} />
                    <MetricPair k="Float" v={fmtB(f.sharesFloat)} />
                    <MetricPair k="Shares Out." v={fmtB(f.sharesOutstanding)} />
                  </div>
                </div>
              </Panel>
            </div>

            {profile.description && (
              <Panel>
                <SectionLabel style={{ marginBottom: 8 }}>About {profile.name}</SectionLabel>
                <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--card-foreground)" }}>{profile.description}</p>
              </Panel>
            )}
          </div>
        </div>
      )}

      {tab === "earnings" && (
        <Panel>
          <SectionLabel style={{ marginBottom: 8 }}>Reported EPS · last {epsHist.length} quarters</SectionLabel>
          {epsHist.length ? <EpsBars history={epsHist} height={130} /> : <div style={{ padding: 30, color: "var(--muted-foreground)" }}>No earnings history.</div>}
        </Panel>
      )}

      {tab === "financials" && (
        <Panel>
          <SectionLabel style={{ marginBottom: 12 }}>Income statement</SectionLabel>
          {!financials ? <div style={{ padding: 30, color: "var(--muted-foreground)" }}>Loading financials…</div>
            : financials.incomeStatement?.length ? (
              <div className="gg-scroll" style={{ overflowX: "auto" }}>
                <table className="fin-table">
                  <thead><tr>{Object.keys(financials.incomeStatement[0]).slice(0, 7).map((k) => <th key={k} style={{ textAlign: "left" }}>{k}</th>)}</tr></thead>
                  <tbody>
                    {financials.incomeStatement.slice(0, 8).map((row, i) => (
                      <tr key={i} className="hover-row">{Object.keys(financials.incomeStatement[0]).slice(0, 7).map((k) => <td key={k} style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 12 }}>{String((row as any)[k] ?? "—")}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div style={{ padding: 30, color: "var(--muted-foreground)" }}>No financial statements available.</div>}
        </Panel>
      )}

      {tab === "insiders" && (
        <Panel pad={false} style={{ overflow: "hidden" }}>
          <div style={{ padding: "var(--pad)", paddingBottom: 10 }}><SectionLabel>Recent insider transactions</SectionLabel></div>
          {profile.insiderTransactions?.length ? (
            <div className="gg-scroll" style={{ overflowX: "auto" }}>
              <table className="fin-table">
                <thead><tr><th style={{ textAlign: "left" }}>Date</th><th style={{ textAlign: "left" }}>Executive</th><th style={{ textAlign: "left" }}>Title</th><th>Type</th><th style={{ textAlign: "right" }}>Shares</th><th style={{ textAlign: "right" }}>Price</th></tr></thead>
                <tbody>
                  {profile.insiderTransactions.slice(0, 12).map((t, i) => (
                    <tr key={i} className="hover-row">
                      <td style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 12 }}>{t.date}</td>
                      <td style={{ textAlign: "left" }}>{t.executive || "—"}</td>
                      <td style={{ textAlign: "left", color: "var(--muted-foreground)", fontSize: 12 }}>{t.title || "—"}</td>
                      <td style={{ color: t.type === "Buy" ? "var(--up)" : "var(--down)", fontWeight: 600 }}>{t.type}</td>
                      <td className="num">{num(t.shares, 0)}</td>
                      <td className="num">{usd(t.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div style={{ padding: 30, color: "var(--muted-foreground)" }}>No insider transactions reported.</div>}
        </Panel>
      )}
    </div>
  )
}
