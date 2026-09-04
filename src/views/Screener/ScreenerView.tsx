import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import researchApi, { ScreenerResult, ScreenerParams } from "@/api/researchApi"
import { Panel, SectionLabel, Delta, Btn, PageHead, fmtB } from "@/components/glass/Glass"
import { ScoreChip } from "@/components/glass/Charts"

type SortKey = "composite" | "value" | "momentum" | "quality" | "analyst" | "pe" | "roe" | "earningsGrowth" | "marketCap"

const fmt = (v: number | null | undefined, d = 2) => v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: d })

export default function ScreenerView() {
  const navigate = useNavigate()
  const [results, setResults] = useState<ScreenerResult[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("composite")
  const [asc, setAsc] = useState(false)

  const [sector, setSector] = useState("")
  const [minScore, setMinScore] = useState(50)
  const [maxPE, setMaxPE] = useState("")
  const [limit] = useState("100")

  useEffect(() => { researchApi.getSectors().then(setSectors); runScreen() }, [])

  function runScreen() {
    setLoading(true)
    const params: ScreenerParams = { limit: parseInt(limit) || 100, min_score: minScore || undefined }
    if (sector) params.sector = sector
    if (maxPE) params.max_pe = parseFloat(maxPE)
    if (["composite", "value", "momentum", "quality", "analyst"].includes(sortKey)) params.sort_by = sortKey as any
    researchApi.screen(params).then((data) => { setResults(data); setLoading(false) })
  }

  function sort(k: SortKey) { if (k === sortKey) setAsc((a) => !a); else { setSortKey(k); setAsc(false) } }

  const rows = useMemo(() => {
    const dir = asc ? 1 : -1
    const get = (x: ScreenerResult): number | null =>
      ["composite", "value", "momentum", "quality", "analyst"].includes(sortKey)
        ? (x.scores as any)[sortKey] : (x as any)[sortKey]
    return [...results].sort((a, b) => {
      const av = get(a), bv = get(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return (av - bv) * dir
    })
  }, [results, sortKey, asc])

  const Th = ({ k, label, right }: { k: SortKey; label: string; right?: boolean }) => (
    <th onClick={() => sort(k)} className="sortable" style={{ textAlign: right ? "right" : "center" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        {label}<span style={{ opacity: sortKey === k ? 1 : 0.3, fontSize: 10 }}>{sortKey === k ? (asc ? "▲" : "▼") : "↕"}</span>
      </span>
    </th>
  )

  return (
    <div>
      <PageHead title="Stock Screener" subtitle={`Cross-sectional quant ranking · ${results.length} names match the current filters.`}>
        <Btn icon="bookmark" kind="ghost">Save screen</Btn>
      </PageHead>

      <Panel style={{ marginBottom: 18 }}>
        <div className="screener-filters">
          <div className="filter-field">
            <SectionLabel>Sector</SectionLabel>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="fin-select">
              <option value="">All sectors</option>
              {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-field">
            <SectionLabel>Min composite · {minScore}</SectionLabel>
            <input type="range" min={0} max={100} value={minScore}
              style={{ ["--p" as any]: `${minScore}%` }}
              onChange={(e) => setMinScore(+e.target.value)} className="fin-range" />
          </div>
          <div className="filter-field">
            <SectionLabel>Max P/E</SectionLabel>
            <input type="number" value={maxPE} placeholder="e.g. 20" onChange={(e) => setMaxPE(e.target.value)} className="fin-input" />
          </div>
          <div className="filter-field" style={{ alignSelf: "end" }}>
            <Btn kind="primary" icon="play" onClick={runScreen} disabled={loading}>{loading ? "Screening…" : "Run screen"}</Btn>
          </div>
        </div>
      </Panel>

      <Panel pad={false} style={{ overflow: "hidden", marginBottom: 18 }}>
        {loading ? (
          <div style={{ padding: 50, textAlign: "center", color: "var(--muted-foreground)" }}>Running quantitative screen…</div>
        ) : (
          <div className="gg-scroll" style={{ overflowX: "auto" }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "right" }}>#</th>
                  <Th k="composite" label="Comp." /><Th k="value" label="Value" /><Th k="momentum" label="Mom." />
                  <Th k="quality" label="Qual." /><Th k="analyst" label="Analyst" />
                  <th style={{ textAlign: "left" }}>Symbol</th>
                  <th style={{ textAlign: "left" }}>Name</th>
                  <th style={{ textAlign: "left" }}>Sector</th>
                  <Th k="marketCap" label="Mkt cap" right /><Th k="pe" label="P/E" right />
                  <Th k="roe" label="ROE" right /><Th k="earningsGrowth" label="EPS Grw" right />
                  <th style={{ textAlign: "right" }}>Target</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.symbol} className="hover-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/research/${r.symbol}`)}>
                    <td className="num" style={{ color: "var(--muted-foreground)" }}>{i + 1}</td>
                    <td style={{ textAlign: "center" }}><ScoreChip value={r.scores.composite} /></td>
                    <td style={{ textAlign: "center" }}><ScoreChip value={r.scores.value} /></td>
                    <td style={{ textAlign: "center" }}><ScoreChip value={r.scores.momentum} /></td>
                    <td style={{ textAlign: "center" }}><ScoreChip value={r.scores.quality} /></td>
                    <td style={{ textAlign: "center" }}><ScoreChip value={r.scores.analyst} /></td>
                    <td style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>{r.symbol}</td>
                    <td style={{ textAlign: "left", maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</td>
                    <td style={{ textAlign: "left", color: "var(--muted-foreground)", fontSize: 12 }}>{r.sector}</td>
                    <td className="num">{fmtB(r.marketCap).replace("$", "")}</td>
                    <td className="num">{fmt(r.pe)}</td>
                    <td className="num">{r.roe != null ? (r.roe * 100).toFixed(1) + "%" : "—"}</td>
                    <td className="num"><Delta value={r.earningsGrowth != null ? r.earningsGrowth * 100 : null} pct d={1} arrow={false} size={12.5} /></td>
                    <td className="num">{r.analystTarget != null ? "$" + fmt(r.analystTarget) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--muted-foreground)" }}>No stocks match the current filters.</div>}
          </div>
        )}
      </Panel>

      <Panel>
        <SectionLabel style={{ marginBottom: 12 }}>Factor definitions</SectionLabel>
        <div className="legend-grid">
          {[["Value", "P/E, P/B, EV/EBITDA cross-sectional rank — lower multiples score higher.", "var(--chart-1)"],
            ["Momentum", "Earnings & revenue growth YoY plus price vs 200-day moving average.", "var(--chart-2)"],
            ["Quality", "ROE, profit margin, and operating margin composite.", "var(--chart-3)"],
            ["Analyst", "Weighted analyst consensus — Strong Buy 2×, Buy 1×.", "var(--chart-4)"],
            ["Composite", "IC-weighted blend using the Grinold-Kahn factor model.", "var(--accent)"]].map(([t, d, c]) => (
            <div key={t} style={{ display: "flex", gap: 10 }}>
              <span style={{ width: 4, borderRadius: 99, background: c, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
