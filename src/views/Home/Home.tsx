import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import marketDataApi from "@/api/marketDataApi"
import researchApi, { ScreenerResult } from "@/api/researchApi"
import { Panel, SectionLabel, Delta, Btn, PageHead } from "@/components/glass/Glass"
import { AreaChart, Sparkline, rampColor } from "@/components/glass/Charts"
import PortfolioPerformanceChart from "./PortfolioPerformanceChart"
import "./Home.css"

type Fred = { labels: string[]; data: number[]; value: number; prev: number }
const SERIES = {
  sp500: "SP500",
  unrate: "UNRATE",
  cpi: "STICKCPIM157SFRBATL",
  tnx: "DGS10",
}

function toFred(raw: [string, number][], maxPoints = 60): Fred {
  const clean = raw.filter(([, v]) => v != null && !isNaN(v as any))
  const sliced = clean.slice(-maxPoints)
  return {
    labels: sliced.map(([d]) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })),
    data: sliced.map(([, v]) => +v),
    value: sliced.length ? +sliced[sliced.length - 1][1] : 0,
    prev: sliced.length > 1 ? +sliced[sliced.length - 2][1] : 0,
  }
}

function KpiCard({ name, sub, fred, unit, fmt, invert, pctChange }:
  { name: string; sub: string; fred: Fred | null; unit: string; fmt: (v: number) => string; invert?: boolean; pctChange?: boolean }) {
  if (!fred) return <Panel style={{ minHeight: 132 }}><SectionLabel>{name}</SectionLabel><div style={{ color: "var(--muted-foreground)", marginTop: 10, fontSize: 13 }}>Loading…</div></Panel>
  const change = pctChange ? ((fred.value - fred.prev) / (fred.prev || 1)) * 100 : fred.value - fred.prev
  const goodUp = invert ? change < 0 : change >= 0
  return (
    <Panel style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <SectionLabel>{name}</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>{fmt(fred.value)}</span>
            <span style={{ fontSize: 15, color: "var(--muted-foreground)" }}>{unit}</span>
          </div>
        </div>
        <Delta value={change} pct={pctChange} d={2} suffix={pctChange ? "" : "pp"} invert={invert} size={12} />
      </div>
      <Sparkline data={fred.data} color={goodUp ? "var(--up)" : "var(--down)"} w={260} h={34} fill />
      <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{sub}</span>
    </Panel>
  )
}

function ChartPanel({ title, sub, fred, color, big, fmt, unit, invert, pctChange }:
  { title: string; sub: string; fred: Fred | null; color: string; big?: boolean; fmt: (v: number) => string; unit: string; invert?: boolean; pctChange?: boolean }) {
  const [range, setRange] = useState("5Y")
  if (!fred) return <Panel style={{ minHeight: big ? 320 : 220 }}><SectionLabel>{title}</SectionLabel><div style={{ color: "var(--muted-foreground)", marginTop: 12 }}>Loading…</div></Panel>
  const slice = { "1Y": 12, "3Y": 36, "5Y": 60 }[range] || 60
  const data = fred.data.slice(-slice)
  const labels = fred.labels.slice(-slice)
  const change = pctChange ? ((fred.value - fred.prev) / (fred.prev || 1)) * 100 : fred.value - fred.prev
  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
        <div>
          <SectionLabel>{title}</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: big ? 30 : 22, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em" }}>{fmt(fred.value)}{unit}</span>
            <Delta value={change} pct={pctChange} d={2} suffix={pctChange ? "" : "pp"} invert={invert} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 2, background: "color-mix(in oklch, var(--foreground) 4%, transparent)", borderRadius: 99, padding: 3 }}>
          {["1Y", "3Y", "5Y"].map((r) => (
            <button key={r} onClick={() => setRange(r)} className="gg-transition"
              style={{ height: 26, padding: "0 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-mono)",
                cursor: "pointer", border: "none", color: range === r ? "var(--accent-foreground)" : "var(--muted-foreground)",
                background: range === r ? "var(--accent)" : "transparent" }}>{r}</button>
          ))}
        </div>
      </div>
      <AreaChart data={data} labels={labels} color={color} height={big ? 230 : 130} fmt={(v) => fmt(v) + unit} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{labels[0]}</span>
        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{sub}</span>
        <span style={{ fontSize: 10.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{labels[labels.length - 1]}</span>
      </div>
    </Panel>
  )
}

type Theme = { sector: string; count: number; avgMomentum: number; avgComposite: number; breadth: number; top: string[] }

export default function Home() {
  const navigate = useNavigate()
  const [sp, setSp] = useState<Fred | null>(null)
  const [unrate, setUnrate] = useState<Fred | null>(null)
  const [cpi, setCpi] = useState<Fred | null>(null)
  const [tnx, setTnx] = useState<Fred | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])

  useEffect(() => {
    marketDataApi.getFredSeries(SERIES.sp500).then((d) => setSp(toFred(d)))
    marketDataApi.getFredSeries(SERIES.unrate).then((d) => setUnrate(toFred(d)))
    marketDataApi.getFredSeries(SERIES.cpi).then((d) => setCpi(toFred(d)))
    marketDataApi.getFredSeries(SERIES.tnx).then((d) => setTnx(toFred(d)))

    researchApi.screen({ limit: 200 }).then((rows: ScreenerResult[]) => {
      const groups: Record<string, ScreenerResult[]> = {}
      rows.forEach((r) => { if (!r.sector) return; (groups[r.sector] ||= []).push(r) })
      const ts: Theme[] = Object.entries(groups).map(([sector, list]) => {
        const avgMomentum = list.reduce((s, x) => s + x.scores.momentum, 0) / list.length
        const avgComposite = list.reduce((s, x) => s + x.scores.composite, 0) / list.length
        const breadth = list.filter((x) => x.scores.momentum >= 55).length / list.length
        const top = [...list].sort((a, b) => b.scores.composite - a.scores.composite).slice(0, 4).map((x) => x.symbol)
        return { sector, count: list.length, avgMomentum, avgComposite, breadth, top }
      }).sort((a, b) => b.avgMomentum - a.avgMomentum)
      setThemes(ts)
    })
  }, [])

  const intFmt = (v: number) => Math.round(v).toLocaleString("en-US")
  const f1 = (v: number) => v.toFixed(1)
  const f2 = (v: number) => v.toFixed(2)

  return (
    <div>
      <PageHead title="Macro & Markets" subtitle="A synced view of the indicators that move the book — equity benchmarks, labor, inflation, and rates.">
        <Btn icon="calendar" kind="ghost">Live · FRED</Btn>
      </PageHead>

      <PortfolioPerformanceChart />

      <div className="kpi-grid" style={{ marginBottom: 18 }}>
        <KpiCard name="S&P 500" sub="FRED · SP500 · daily close" fred={sp} unit="" fmt={intFmt} pctChange />
        <KpiCard name="Unemployment Rate" sub="FRED · UNRATE · seasonally adj." fred={unrate} unit="%" fmt={f1} invert />
        <KpiCard name="Sticky Price CPI" sub="FRED · Atlanta Fed · YoY" fred={cpi} unit="%" fmt={f1} invert />
        <KpiCard name="10-Year Treasury" sub="FRED · DGS10 · constant maturity" fred={tnx} unit="%" fmt={f2} invert />
      </div>

      <div className="macro-main" style={{ marginBottom: 26 }}>
        <ChartPanel title="S&P 500" sub="FRED · SP500" fred={sp} color="var(--chart-1)" big fmt={intFmt} unit="" pctChange />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <ChartPanel title="Unemployment Rate" sub="FRED · UNRATE" fred={unrate} color="var(--chart-4)" fmt={f1} unit="%" invert />
          <ChartPanel title="Sticky Price CPI" sub="FRED · YoY" fred={cpi} color="var(--chart-5)" fmt={f1} unit="%" invert />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <h3 style={{ font: "var(--text-h3)", margin: 0 }}>Investment themes</h3>
          <p className="lead" style={{ fontSize: 13.5, marginTop: 4 }}>Sectors ranked by live quant momentum across the screening universe.</p>
        </div>
        <Btn icon="sliders" kind="ghost" onClick={() => navigate("/screener")}>Open screener</Btn>
      </div>
      <div className="theme-grid">
        {themes.length === 0 && [0, 1, 2, 3].map((i) => <Panel key={i} style={{ minHeight: 150 }}><div style={{ color: "var(--muted-foreground)" }}>Loading…</div></Panel>)}
        {themes.map((t) => (
          <Panel key={t.sector} className="theme-card" onClick={() => navigate("/screener")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: "-0.01em" }}>{t.sector}</span>
                  {t.avgMomentum >= 65 && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "var(--chart-4)",
                    background: "color-mix(in oklch, var(--chart-4) 18%, transparent)", padding: "2px 6px", borderRadius: 5 }}>HOT</span>}
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                  {t.top.map((tk) => (
                    <span key={tk} style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted-foreground)",
                      border: "1px solid var(--border)", borderRadius: 5, padding: "1px 5px" }}>{tk}</span>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 12 }}>
              <div>
                <div className="label" style={{ fontSize: 9 }}>Momentum</div>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, color: rampColor(t.avgMomentum) }}>{Math.round(t.avgMomentum)}</span>
              </div>
              <div>
                <div className="label" style={{ fontSize: 9 }}>Composite</div>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>{Math.round(t.avgComposite)}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="label" style={{ fontSize: 9 }}>Breadth · {t.count}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, justifyContent: "flex-end" }}>
                  <div style={{ width: 38, height: 5, borderRadius: 99, background: "var(--muted)", overflow: "hidden" }}>
                    <div style={{ width: `${t.breadth * 100}%`, height: "100%", background: rampColor(t.breadth * 100) }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--muted-foreground)" }}>{Math.round(t.breadth * 100)}%</span>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
