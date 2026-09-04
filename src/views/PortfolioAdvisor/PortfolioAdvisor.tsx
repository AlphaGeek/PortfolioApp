import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import researchApi, { AdvisorRecommendation, AdvisorRequest, PortfolioPick } from "@/api/researchApi"
import portfolioApi, { Portfolio } from "@/api/portfolioApi"
import { Panel, SectionLabel, Btn, PageHead, fmtUSD } from "@/components/glass/Glass"
import { Donut, FactorBar } from "@/components/glass/Charts"
import Icon from "@/components/glass/Icon"
import PortfolioManagerPanel from "./PortfolioManagerPanel"

type Risk = "conservative" | "moderate" | "aggressive"
const RISK: Record<Risk, { label: string; desc: string; color: string }> = {
  conservative: { label: "Conservative", desc: "Large-cap, low-beta, dividend-paying. Lower drawdown.", color: "var(--chart-3)" },
  moderate:     { label: "Moderate", desc: "Balanced growth and value. Mid-to-large cap focus.", color: "var(--chart-1)" },
  aggressive:   { label: "Aggressive", desc: "High-momentum, high-growth. Higher volatility & upside.", color: "var(--chart-4)" },
}
const DONUT_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)",
  "oklch(0.7 0.16 280)", "oklch(0.72 0.15 200)", "oklch(0.74 0.13 140)", "oklch(0.7 0.18 330)", "oklch(0.72 0.14 90)"]

const fmt = (v: number | null | undefined, d = 2) => v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: d })

/* minimal markdown → React for the AI brief */
function Markdown({ text }: { text: string }) {
  const inline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) => p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>)
  }
  const lines = text.split("\n")
  const out: React.ReactNode[] = []
  let list: string[] = []
  const flush = () => { if (list.length) { out.push(<ul key={"ul" + out.length}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>); list = [] } }
  lines.forEach((raw, i) => {
    const l = raw.trim()
    if (!l) { flush(); return }
    if (l.startsWith("### ")) { flush(); out.push(<h3 key={i}>{l.slice(4)}</h3>) }
    else if (l.startsWith("## ")) { flush(); out.push(<h3 key={i}>{l.slice(3)}</h3>) }
    else if (l.startsWith("# ")) { flush(); out.push(<h2 key={i}>{inline(l.slice(2))}</h2>) }
    else if (l === "---") { flush(); out.push(<hr key={i} />) }
    else if (l.startsWith("- ") || l.startsWith("* ")) { list.push(l.slice(2)) }
    else { flush(); out.push(<p key={i}>{inline(l)}</p>) }
  })
  flush()
  return <div className="brief">{out}</div>
}

type TradeMode = "single" | "all"

export default function PortfolioAdvisor() {
  const navigate = useNavigate()
  const [sectors, setSectors] = useState<string[]>([])
  const [risk, setRisk] = useState<Risk>("aggressive")
  const [amount, setAmount] = useState("1000000")
  const [nStocks, setNStocks] = useState(20)
  const [sector, setSector] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AdvisorRecommendation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hov, setHov] = useState<number | null>(null)

  const [showTrade, setShowTrade] = useState(false)
  const [tradeMode, setTradeMode] = useState<TradeMode>("single")
  const [tradePick, setTradePick] = useState<PortfolioPick | null>(null)
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [selPf, setSelPf] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [trading, setTrading] = useState(false)
  const [tradeMsg, setTradeMsg] = useState<string | null>(null)

  useEffect(() => { researchApi.getSectors().then(setSectors) }, [])

  async function generate() {
    setLoading(true); setError(null); setResult(null)
    const req: AdvisorRequest = { risk_tolerance: risk, amount: parseFloat(amount) || 100000, n_stocks: nStocks }
    if (sector) req.sector = sector
    const data = await researchApi.recommend(req)
    if (data) setResult(data); else setError("Unable to generate a recommendation. Try different parameters.")
    setLoading(false)
  }

  async function openTrade(mode: TradeMode, pick?: PortfolioPick) {
    setTradeMode(mode); setTradePick(pick ?? null); setSelPf(null); setCreating(false); setNewName(""); setTradeMsg(null); setShowTrade(true)
    setPortfolios(await portfolioApi.getPortfolio())
  }
  function closeTrade() { setShowTrade(false); setTradePick(null); setTradeMsg(null) }

  async function confirmTrade() {
    if (!result) return
    let targetId = selPf
    if (creating) {
      const created = await portfolioApi.createPortfolio(newName.trim() || "My Portfolio")
      if (!created) { setTradeMsg("Failed to create portfolio"); return }
      targetId = created.portfolioId
    }
    if (targetId == null) { setTradeMsg("Please select or create a portfolio"); return }
    const picks = tradeMode === "single" && tradePick ? [tradePick] : result.picks
    setTrading(true); setTradeMsg(null)
    let ok = 0, fail = 0
    for (const p of picks) {
      const price = p.currentPrice
      if (!price || price <= 0) { fail++; continue }
      const shares = Math.round((p.dollarAmount / price) * 1000) / 1000
      try { await portfolioApi.placeTrade(targetId, { symbol: p.symbol, side: "BUY", numShares: shares, price }); ok++ }
      catch { fail++ }
    }
    setTrading(false); setTradeMsg(`Trade complete: ${ok} placed${fail ? `, ${fail} failed` : ""}`)
  }

  const cfg = RISK[risk]
  const picks = result?.picks ?? []
  const slices = picks.map((p, i) => ({ value: p.weight, color: DONUT_COLORS[i % DONUT_COLORS.length], label: p.symbol }))
  const totalInv = picks.reduce((s, p) => s + p.dollarAmount, 0)
  const sectorsCount = result ? Object.keys(result.meta.sectorCounts).length : 0
  const avgComposite = picks.length ? Math.round(picks.reduce((s, p) => s + p.scores.composite, 0) / picks.length) : 0

  return (
    <div>
      <PageHead title="Portfolio Advisor"
        subtitle="Quantitative construction with Grinold-Kahn factor scoring, inverse-beta risk parity, and an AI-generated investment narrative." />

      <PortfolioManagerPanel />

      <PageHead title="One-shot recommender"
        subtitle="Generate a standalone quant recommendation you can trade into any portfolio manually." />

      <Panel style={{ marginBottom: 18 }}>
        <SectionLabel style={{ marginBottom: 10 }}>Risk profile</SectionLabel>
        <div className="risk-row" style={{ marginBottom: 16 }}>
          {(Object.keys(RISK) as Risk[]).map((k) => (
            <button key={k} onClick={() => setRisk(k)} className="gg-transition"
              style={{ flex: 1, padding: "12px 14px", borderRadius: 14, textAlign: "left", border: "1px solid",
                borderColor: risk === k ? RISK[k].color : "var(--border)", cursor: "pointer",
                background: risk === k ? `color-mix(in oklch, ${RISK[k].color} 12%, transparent)` : "color-mix(in oklch, var(--foreground) 3%, transparent)" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: risk === k ? RISK[k].color : "var(--foreground)" }}>{RISK[k].label}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted-foreground)", marginTop: 3, lineHeight: 1.4 }}>{RISK[k].desc}</div>
            </button>
          ))}
        </div>
        <div className="advisor-inputs">
          <div className="filter-field">
            <SectionLabel>Investment amount</SectionLabel>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }}>$</span>
              <input value={Number(amount || 0).toLocaleString()} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                className="fin-input" style={{ paddingLeft: 22 }} />
            </div>
          </div>
          <div className="filter-field">
            <SectionLabel># Holdings · {nStocks}</SectionLabel>
            <input type="range" min={5} max={20} value={nStocks} style={{ ["--p" as any]: `${((nStocks - 5) / 15) * 100}%` }}
              onChange={(e) => setNStocks(+e.target.value)} className="fin-range" />
          </div>
          <div className="filter-field">
            <SectionLabel>Sector focus</SectionLabel>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className="fin-select">
              <option value="">All sectors</option>
              {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-field" style={{ alignSelf: "end" }}>
            <div className="siri-glow" style={{ borderRadius: 99 }}>
              <Btn kind="primary" icon="sparkles" onClick={generate} disabled={loading}
                style={{ width: "100%", justifyContent: "center", height: 42, position: "relative", zIndex: 1 }}>
                {loading ? "Generating…" : "Generate portfolio"}</Btn>
            </div>
          </div>
        </div>
      </Panel>

      {error && <Panel style={{ marginBottom: 18, color: "var(--down)" }}>{error}</Panel>}

      {loading && (
        <Panel style={{ textAlign: "center", padding: 50 }}>
          <div className="fin-spinner" style={{ margin: "0 auto 16px" }} />
          <p className="lead" style={{ fontSize: 14 }}>Running quantitative model and generating AI narrative…</p>
        </Panel>
      )}

      {result && !loading && (
        <>
          <div className="advisor-summary" style={{ marginBottom: 18 }}>
            {([["Holdings", picks.length], ["Capital", fmtUSD(totalInv)], ["Risk profile", cfg.label],
              ["Sectors", sectorsCount], ["Min score", result.meta.minScorePct + "th"], ["Avg composite", avgComposite]] as [string, any][]).map(([k, v], i) => (
              <Panel key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: k === "Risk profile" ? cfg.color : "var(--foreground)" }}>{v}</div>
                <SectionLabel style={{ marginTop: 4 }}>{k}</SectionLabel>
              </Panel>
            ))}
          </div>

          <div className="advisor-result-grid" style={{ marginBottom: 18 }}>
            <Panel>
              <SectionLabel style={{ marginBottom: 12 }}>Allocation</SectionLabel>
              <div style={{ display: "flex", justifyContent: "center", position: "relative", marginBottom: 14 }}>
                <Donut slices={slices} hovered={hov} onHover={setHov} size={172} thickness={22} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 15 }}>{hov != null ? picks[hov].symbol : picks.length}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>{hov != null ? (picks[hov].weight * 100).toFixed(1) + "%" : "names"}</div>
                </div>
              </div>
              <div className="gg-scroll" style={{ maxHeight: 220, overflowY: "auto" }}>
                {picks.map((p, i) => (
                  <div key={p.symbol} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: hov == null || hov === i ? 1 : 0.45, transition: "opacity .15s" }}>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{p.symbol}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{(p.weight * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ display: "flex", color: "var(--accent)" }}><Icon name="sparkles" size={16} /></span>
                <SectionLabel style={{ marginBottom: 0 }}>AI Investment Brief</SectionLabel>
                <span style={{ marginLeft: "auto", fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)",
                  border: "1px solid var(--border)", borderRadius: 6, padding: "2px 7px" }}>FinAI · narrative</span>
              </div>
              <div className="gg-scroll" style={{ maxHeight: 460, overflowY: "auto", paddingRight: 8 }}>
                <Markdown text={result.narrative} />
              </div>
            </Panel>
          </div>

          <Panel pad={false} style={{ overflow: "hidden", marginBottom: 18 }}>
            <div style={{ padding: "var(--pad)", paddingBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SectionLabel>Recommended holdings</SectionLabel>
              <Btn kind="accentGhost" icon="zap" style={{ height: 32 }} onClick={() => openTrade("all")}>Trade all</Btn>
            </div>
            <div className="gg-scroll" style={{ overflowX: "auto" }}>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Symbol</th><th style={{ textAlign: "left" }}>Sector</th>
                    <th style={{ textAlign: "right" }}>Weight</th><th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ minWidth: 110 }}>Composite</th><th style={{ minWidth: 90 }}>Value</th>
                    <th style={{ minWidth: 90 }}>Momentum</th><th style={{ minWidth: 90 }}>Quality</th>
                    <th style={{ textAlign: "right" }}>P/E</th><th style={{ textAlign: "right" }}>ROE</th>
                    <th style={{ textAlign: "right" }}>Beta</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {picks.map((p) => (
                    <tr key={p.symbol} className="hover-row">
                      <td style={{ textAlign: "left" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>{p.symbol}</div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      </td>
                      <td style={{ textAlign: "left", fontSize: 12, color: "var(--muted-foreground)" }}>{p.sector}</td>
                      <td className="num" style={{ fontWeight: 600 }}>{(p.weight * 100).toFixed(1)}%</td>
                      <td className="num">{fmtUSD(p.dollarAmount)}</td>
                      <td><FactorBar value={p.scores.composite} width={64} /></td>
                      <td><FactorBar value={p.scores.value} width={50} /></td>
                      <td><FactorBar value={p.scores.momentum} width={50} /></td>
                      <td><FactorBar value={p.scores.quality} width={50} /></td>
                      <td className="num">{fmt(p.pe)}</td>
                      <td className="num">{p.roe != null ? (p.roe * 100).toFixed(1) + "%" : "—"}</td>
                      <td className="num">{fmt(p.beta)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                          <button className="mini-btn" onClick={() => navigate(`/research/${p.symbol}`)}>Research</button>
                          <button className="mini-btn" style={{ color: "var(--accent)" }} onClick={() => openTrade("single", p)}>Trade</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div style={{ fontSize: 12, color: "var(--muted-foreground)", lineHeight: 1.6, padding: "0 4px" }}>
            <b style={{ color: "var(--foreground)" }}>Methodology:</b> Names are selected with the Grinold-Kahn IC-weighted factor model
            (value IC 0.04, momentum 0.05, quality 0.03, analyst 0.05). Position sizes use inverse-beta risk parity, max 2 per sector.
            Min score: {result.meta.minScorePct}th percentile · Max beta: {result.meta.maxBeta} · Min market cap: ${(result.meta.minMarketCap / 1e9).toFixed(0)}B.
          </div>
        </>
      )}

      {showTrade && (
        <div onClick={closeTrade} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} className="gg-glass gg-glass-inset"
            style={{ borderRadius: 22, padding: 24, width: 420, maxWidth: "100%", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ margin: 0, font: "var(--text-h3)" }}>{tradeMode === "single" ? `Trade ${tradePick?.symbol}` : "Trade all holdings"}</h3>
              <button onClick={closeTrade} style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              {tradeMode === "single" && tradePick ? (
                <>
                  <TradeRow k="Amount to invest" v={fmtUSD(tradePick.dollarAmount)} />
                  {tradePick.currentPrice && <TradeRow k="Current price" v={"$" + fmt(tradePick.currentPrice)} />}
                  {tradePick.currentPrice && <TradeRow k="Estimated shares" v={String(Math.round((tradePick.dollarAmount / tradePick.currentPrice) * 1000) / 1000)} />}
                </>
              ) : (
                <>
                  <TradeRow k="Securities to buy" v={String(picks.length)} />
                  <TradeRow k="Total investment" v={fmtUSD(picks.reduce((s, p) => s + p.dollarAmount, 0))} />
                </>
              )}
            </div>
            <SectionLabel style={{ marginBottom: 6 }}>Select portfolio</SectionLabel>
            <select className="fin-select" value={creating ? "__create__" : (selPf ?? "")} disabled={trading}
              onChange={(e) => { const v = e.target.value; if (v === "__create__") { setCreating(true); setSelPf(null) } else { setCreating(false); setSelPf(v ? parseInt(v) : null) } }}>
              <option value="" disabled>Choose a portfolio…</option>
              {portfolios.map((pf) => <option key={pf.portfolioId} value={pf.portfolioId}>{pf.name}</option>)}
              <option value="__create__">+ Create new portfolio</option>
            </select>
            {creating && (
              <input className="fin-input" style={{ marginTop: 10 }} type="text" value={newName} placeholder="My Portfolio"
                onChange={(e) => setNewName(e.target.value)} disabled={trading} autoFocus />
            )}
            {tradeMsg && <div style={{ marginTop: 14, fontSize: 13, color: tradeMsg.includes("failed") ? "var(--down)" : "var(--up)" }}>{tradeMsg}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <Btn kind="ghost" onClick={closeTrade} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
              <Btn kind="primary" onClick={confirmTrade} disabled={trading || (selPf == null && !creating)} style={{ flex: 1, justifyContent: "center" }}>
                {trading ? "Placing…" : "Confirm trade"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TradeRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
      <span style={{ color: "var(--muted-foreground)" }}>{k}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{v}</span>
    </div>
  )
}
