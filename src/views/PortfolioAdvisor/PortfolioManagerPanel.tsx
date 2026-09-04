import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx"
import pmApi, { AgentPortfolioDetail, AgentDecision, DecisionAction } from "@/api/portfolioManagerApi"
import { Panel, SectionLabel, Btn, fmtUSD, fmtNum, fmtPct } from "@/components/glass/Glass"
import { ScoreChip } from "@/components/glass/Charts"
import Icon from "@/components/glass/Icon"

const ACTION_COLOR: Record<DecisionAction, string> = {
  BUY: "var(--up)",
  ADD: "var(--up)",
  TRIM: "var(--chart-4)",
  SELL: "var(--down)",
}

function ActionBadge({ action }: { action: DecisionAction }) {
  const c = ACTION_COLOR[action]
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 44, height: 22,
      padding: "0 8px", borderRadius: 7, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: c,
      background: `color-mix(in oklch, ${c} 16%, transparent)`, letterSpacing: "0.03em" }}>{action}</span>
  )
}

export default function PortfolioManagerPanel() {
  const navigate = useNavigate()
  const [portfolioId, setPortfolioId] = useState<number | null>(null)
  const [detail, setDetail] = useState<AgentPortfolioDetail | null>(null)
  const [decisions, setDecisions] = useState<AgentDecision[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [narrative, setNarrative] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  async function loadAll(pid: number) {
    const [d, dec] = await Promise.all([pmApi.getHoldings(pid), pmApi.getDecisions(pid, 50)])
    setDetail(d); setDecisions(dec)
  }

  useEffect(() => {
    (async () => {
      const pf = await pmApi.init()
      if (!pf) { setError("Could not initialize the agent portfolio."); setLoading(false); return }
      setPortfolioId(pf.portfolioId)
      await loadAll(pf.portfolioId)
      setLoading(false)
    })()
  }, [])

  function handleExport() {
    if (!detail) return
    const holdingsSheet = XLSX.utils.json_to_sheet(holdings.map((h) => ({
      Symbol: h.symbol, Sector: h.sector ?? "", Weight: h.weight != null ? h.weight : "",
      Shares: h.numShares, "Avg cost": h.avgPrice ?? "", Price: h.currentPrice ?? "",
      Value: h.marketValue ?? "", pmScore: h.pmScore ?? "", Beta: h.beta ?? "",
    })))
    const decisionsSheet = XLSX.utils.json_to_sheet(decisions.map((d) => ({
      Date: new Date(d.runAt).toLocaleString("en-US"), Action: d.action, Symbol: d.symbol,
      Shares: d.numShares, Price: d.price, Amount: d.dollarAmount, Rationale: d.rationale,
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, holdingsSheet, "Holdings")
    XLSX.utils.book_append_sheet(wb, decisionsSheet, "Decision log")
    const dateStr = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `${(detail.name || "agent-portfolio").replace(/[^a-z0-9]+/gi, "-")}_${dateStr}.xlsx`)
  }

  async function handleRun() {
    if (!portfolioId) return
    setRunning(true); setError(null); setNarrative(null)
    try {
      const result = await pmApi.run(portfolioId)
      if (result) setNarrative(result.narrative)
      await loadAll(portfolioId)
    } catch (e: any) {
      setError(e.message || "Rebalance failed")
    } finally {
      setRunning(false)
    }
  }

  const holdings = detail?.holdings ?? []
  const sectorsCount = new Set(holdings.map((h) => h.sector).filter(Boolean)).size

  return (
    <Panel pad={false} style={{ overflow: "hidden", marginBottom: 22 }}>
      <div style={{ padding: "var(--pad)", paddingBottom: 14, display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", color: "var(--accent)" }}><Icon name="activity" size={18} /></span>
            <h3 style={{ margin: 0, font: "var(--text-h3)" }}>Portfolio Manager</h3>
          </div>
          <p className="lead" style={{ fontSize: 13, marginTop: 5, maxWidth: 620 }}>
            An autonomous agent managing {detail?.name ?? "your quant portfolio"} with a blended Greenblatt
            Magic Formula + Grinold-Kahn factor process — 30-100 names, sector-capped, sized by score and
            inverse beta, rebalanced only when a position drifts past its no-trade band.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn kind="ghost" icon="download" onClick={handleExport} disabled={loading || !detail}>
            Export
          </Btn>
          <Btn kind="primary" icon="sparkles" onClick={handleRun} disabled={running || loading}>
            {running ? "Running…" : "Run Portfolio Manager"}
          </Btn>
        </div>
      </div>

      {loading && <div style={{ padding: "0 var(--pad) 24px", color: "var(--muted-foreground)" }}>Loading agent portfolio…</div>}
      {error && <div style={{ margin: "0 var(--pad) 16px", color: "var(--down)", fontSize: 13 }}>{error}</div>}

      {!loading && detail && (
        <>
          <div className="advisor-summary" style={{ padding: "0 var(--pad)", marginBottom: 18 }}>
            {([["Total value", fmtUSD(detail.totalValue)], ["Cash", fmtUSD(detail.cash)],
              ["Holdings", holdings.length], ["Sectors", sectorsCount],
              ["Inception", new Date(detail.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })]
            ] as [string, any][]).map(([k, v], i) => (
              <Panel key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{v}</div>
                <SectionLabel style={{ marginTop: 4 }}>{k}</SectionLabel>
              </Panel>
            ))}
          </div>

          {narrative && (
            <Panel style={{ margin: "0 var(--pad) 18px", background: "color-mix(in oklch, var(--accent) 6%, transparent)" }}>
              <SectionLabel style={{ marginBottom: 6 }}>Latest rebalance narrative</SectionLabel>
              <p style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{narrative}</p>
            </Panel>
          )}

          <div style={{ padding: "0 var(--pad)", marginBottom: 8 }}>
            <SectionLabel>Holdings ({holdings.length})</SectionLabel>
          </div>
          <div className="gg-scroll" style={{ overflowX: "auto", marginBottom: 22 }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Symbol</th><th style={{ textAlign: "left" }}>Sector</th>
                  <th style={{ textAlign: "right" }}>Weight</th><th style={{ textAlign: "right" }}>Shares</th>
                  <th style={{ textAlign: "right" }}>Avg cost</th><th style={{ textAlign: "right" }}>Price</th>
                  <th style={{ textAlign: "right" }}>Value</th><th style={{ textAlign: "right" }}>P/L</th>
                  <th style={{ textAlign: "center" }}>pmScore</th><th style={{ textAlign: "right" }}>Beta</th><th></th>
                </tr>
              </thead>
              <tbody>
                {holdings.length === 0 && (
                  <tr><td colSpan={11} style={{ textAlign: "center", padding: 24, color: "var(--muted-foreground)" }}>
                    No holdings yet — click "Run Portfolio Manager" to build the initial book.</td></tr>
                )}
                {holdings.map((h) => {
                  const plPct = h.avgPrice && h.currentPrice ? ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100 : null
                  return (
                    <tr key={h.symbol} className="hover-row">
                      <td style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>{h.symbol}</td>
                      <td style={{ textAlign: "left", fontSize: 12, color: "var(--muted-foreground)" }}>{h.sector ?? "—"}</td>
                      <td className="num">{h.weight != null ? (h.weight * 100).toFixed(1) + "%" : "—"}</td>
                      <td className="num">{fmtNum(h.numShares, 2)}</td>
                      <td className="num">{h.avgPrice != null ? fmtUSD(h.avgPrice, 2) : "—"}</td>
                      <td className="num">{h.currentPrice != null ? fmtUSD(h.currentPrice, 2) : "—"}</td>
                      <td className="num">{h.marketValue != null ? fmtUSD(h.marketValue) : "—"}</td>
                      <td className="num" style={{ color: plPct == null ? undefined : plPct >= 0 ? "var(--up)" : "var(--down)" }}>
                        {fmtPct(plPct)}</td>
                      <td style={{ textAlign: "center" }}>{h.pmScore != null ? <ScoreChip value={h.pmScore} /> : "—"}</td>
                      <td className="num">{h.beta != null ? h.beta.toFixed(2) : "—"}</td>
                      <td><button className="mini-btn" onClick={() => navigate(`/research/${h.symbol}`)}>Research</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: "0 var(--pad)", marginBottom: 8 }}>
            <SectionLabel>Decision log</SectionLabel>
          </div>
          <div className="gg-scroll" style={{ overflowX: "auto", maxHeight: 380, overflowY: "auto", paddingBottom: 16 }}>
            <table className="fin-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Date</th><th style={{ textAlign: "left" }}>Action</th>
                  <th style={{ textAlign: "left" }}>Symbol</th><th style={{ textAlign: "right" }}>Shares</th>
                  <th style={{ textAlign: "right" }}>Price</th><th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "left" }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {decisions.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--muted-foreground)" }}>
                    No decisions logged yet.</td></tr>
                )}
                {decisions.map((d, i) => (
                  <tr key={i} className="hover-row" onClick={() => setExpanded(expanded === i ? null : i)} style={{ cursor: "pointer" }}>
                    <td style={{ textAlign: "left", fontSize: 11.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
                      {new Date(d.runAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ textAlign: "left" }}><ActionBadge action={d.action} /></td>
                    <td style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontWeight: 700 }}>{d.symbol}</td>
                    <td className="num">{fmtNum(d.numShares, 2)}</td>
                    <td className="num">{fmtUSD(d.price, 2)}</td>
                    <td className="num">{fmtUSD(d.dollarAmount)}</td>
                    <td style={{ textAlign: "left", fontSize: 12, color: "var(--muted-foreground)", maxWidth: expanded === i ? "none" : 360,
                      overflow: expanded === i ? "visible" : "hidden", textOverflow: "ellipsis",
                      whiteSpace: expanded === i ? "normal" : "nowrap" }}>{d.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.6, padding: "0 var(--pad) var(--pad)" }}>
            <b style={{ color: "var(--foreground)" }}>Methodology:</b> pmScore blends a Greenblatt Magic Formula rank
            (earnings yield via EBITDA/EV, return on capital via ROA) with the Grinold-Kahn IC-weighted factor
            composite (value/momentum/quality/analyst) used elsewhere in FinAI. Positions are sized by score
            and inverse-beta risk tilt, clamped to 0.25x-4x equal weight, capped at ~1/6 of holdings per sector,
            and excludes financials, utilities, and (best-effort) foreign ADRs. Trades only fire when a position
            drifts more than 20% from target, to avoid churning on noise.
          </div>
        </>
      )}
    </Panel>
  )
}
