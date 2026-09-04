import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import portfolioApi, { Holding } from "@/api/portfolioApi"
import TradeForm from "./TradeForm"
import { Panel, SectionLabel, Delta, Btn, PageHead, fmtUSD } from "@/components/glass/Glass"
import { Donut } from "@/components/glass/Charts"

const DONUT_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)",
  "oklch(0.7 0.16 280)", "oklch(0.72 0.15 200)", "oklch(0.74 0.13 140)", "oklch(0.7 0.18 330)", "oklch(0.72 0.14 90)"]

type Row = Holding & { mv: number; cost: number; pl: number; plPct: number }

function StatBlock({ label, value, sub, accent }: { label: string; value: any; sub?: any; accent?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <SectionLabel>{label}</SectionLabel>
      <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.02em", color: accent || "var(--foreground)" }}>{value}</span>
      {sub != null && <span style={{ fontSize: 12 }}>{sub}</span>}
    </div>
  )
}

export default function PortfolioPage() {
  const portfolio = useSelector((s: any) => s.portfolio.portfolio)
  const portfolioLoaded = useSelector((s: any) => s.portfolio.loaded)
  const navigate = useNavigate()

  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(false)
  const [hov, setHov] = useState<number | null>(null)
  const [trade, setTrade] = useState<{ symbol: string; side: "BUY" | "SELL" } | null>(null)

  const loadHoldings = useCallback(async () => {
    if (!portfolio?.portfolioId) return
    setLoading(true)
    setHoldings(await portfolioApi.getHoldings(portfolio.portfolioId))
    setLoading(false)
  }, [portfolio?.portfolioId])

  useEffect(() => {
    if (portfolioLoaded && !portfolio) navigate("/")
    else loadHoldings()
  }, [portfolio, portfolioLoaded])

  function openTrade(symbol = "", side: "BUY" | "SELL" = "BUY") { setTrade({ symbol, side }) }
  function onTradeSuccess() { setTrade(null); loadHoldings() }

  const rows: Row[] = holdings.map((h) => {
    const price = h.currentPrice ?? h.avgPrice ?? 0
    const mv = h.numShares * price
    const cost = h.numShares * (h.avgPrice ?? price)
    return { ...h, mv, cost, pl: mv - cost, plPct: cost ? (mv - cost) / cost : 0 }
  })
  const totalMv = rows.reduce((s, h) => s + h.mv, 0)
  const totalCost = rows.reduce((s, h) => s + h.cost, 0)
  const totalPl = totalMv - totalCost
  const slices = rows.map((h, i) => ({ value: h.mv, color: DONUT_COLORS[i % DONUT_COLORS.length], label: h.symbol }))

  if (!portfolioLoaded) return <div style={{ padding: 40, color: "var(--muted-foreground)" }}>Loading…</div>

  return (
    <div>
      <PageHead title="My Portfolio" subtitle={portfolio?.name ? `${portfolio.name} · live positions with unrealized P/L.` : "Live positions with unrealized P/L."}>
        <Btn icon="download" kind="ghost">Export</Btn>
        <Btn icon="plus" kind="primary" onClick={() => openTrade("", "BUY")}>New trade</Btn>
      </PageHead>

      {loading ? (
        <Panel style={{ padding: 40, color: "var(--muted-foreground)" }}>Loading holdings…</Panel>
      ) : rows.length === 0 ? (
        <Panel style={{ textAlign: "center", padding: 60 }}>
          <p className="lead" style={{ fontSize: 15 }}>No holdings yet.</p>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
            <Btn kind="primary" icon="plus" onClick={() => openTrade("", "BUY")}>Place your first trade</Btn>
          </div>
        </Panel>
      ) : (
        <>
          <Panel style={{ marginBottom: 18 }}>
            <div className="port-summary">
              <StatBlock label="Market value" value={fmtUSD(totalMv)} sub={<span style={{ color: "var(--muted-foreground)" }}>{rows.length} positions</span>} />
              <StatBlock label="Cost basis" value={fmtUSD(totalCost)} />
              <StatBlock label="Total P / L" value={fmtUSD(totalPl)} accent={totalPl >= 0 ? "var(--up)" : "var(--down)"}
                sub={<Delta value={totalCost ? (totalPl / totalCost) * 100 : 0} pct d={2} />} />
              <StatBlock label="Positions" value={rows.length} />
              <StatBlock label="Best mover" value={rows.reduce((b, h) => h.plPct > b.plPct ? h : b, rows[0]).symbol}
                sub={<Delta value={rows.reduce((b, h) => h.plPct > b.plPct ? h : b, rows[0]).plPct * 100} pct d={1} />} />
            </div>
          </Panel>

          <div className="port-grid">
            <Panel style={{ display: "flex", flexDirection: "column" }}>
              <SectionLabel style={{ marginBottom: 14 }}>Allocation</SectionLabel>
              <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                <Donut slices={slices} hovered={hov} onHover={setHov} size={176} thickness={24} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 15 }}>{hov != null ? rows[hov].symbol : fmtUSD(totalMv)}</div>
                  <div style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>{hov != null ? ((rows[hov].mv / totalMv) * 100).toFixed(1) + "%" : "invested"}</div>
                </div>
              </div>
              <div className="gg-scroll" style={{ marginTop: 14, maxHeight: 220, overflowY: "auto" }}>
                {rows.map((h, i) => (
                  <div key={h.symbol} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: hov == null || hov === i ? 1 : 0.45, transition: "opacity .15s" }}>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600 }}>{h.symbol}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{((h.mv / totalMv) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel pad={false} style={{ overflow: "hidden" }}>
              <div style={{ padding: "var(--pad)", paddingBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <SectionLabel>Holdings</SectionLabel>
                <span style={{ fontSize: 11.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{rows.length} positions</span>
              </div>
              <div className="gg-scroll" style={{ overflowX: "auto" }}>
                <table className="fin-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Symbol</th>
                      <th style={{ textAlign: "right" }}>Shares</th>
                      <th style={{ textAlign: "right" }}>Avg cost</th>
                      <th style={{ textAlign: "right" }}>Price</th>
                      <th style={{ textAlign: "right" }}>Mkt value</th>
                      <th style={{ textAlign: "right" }}>Unreal. P/L</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((h) => (
                      <tr key={h.symbol} className="hover-row">
                        <td style={{ textAlign: "left" }}>
                          <button onClick={() => navigate(`/research/${h.symbol}`)} style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent)" }}>{h.symbol}</span>
                          </button>
                        </td>
                        <td className="num">{h.numShares.toLocaleString()}</td>
                        <td className="num">{h.avgPrice != null ? "$" + h.avgPrice.toFixed(2) : "—"}</td>
                        <td className="num">{h.currentPrice != null ? "$" + h.currentPrice.toFixed(2) : "—"}</td>
                        <td className="num" style={{ fontWeight: 600 }}>{fmtUSD(h.mv)}</td>
                        <td className="num">
                          <div style={{ fontWeight: 600, color: h.pl >= 0 ? "var(--up)" : "var(--down)" }}>{fmtUSD(h.pl)}</div>
                          <div style={{ fontSize: 11 }}><Delta value={h.plPct * 100} pct d={1} arrow={false} size={11} /></div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                            <button className="mini-btn" style={{ color: "var(--up)" }} onClick={() => openTrade(h.symbol, "BUY")}>Buy</button>
                            <button className="mini-btn" style={{ color: "var(--down)" }} onClick={() => openTrade(h.symbol, "SELL")}>Sell</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      )}

      {trade && portfolio && (
        <TradeForm portfolioId={portfolio.portfolioId} defaultSymbol={trade.symbol} defaultSide={trade.side}
          defaultPrice={rows.find((r) => r.symbol === trade.symbol)?.currentPrice ?? undefined}
          onSuccess={onTradeSuccess} onCancel={() => setTrade(null)} />
      )}
    </div>
  )
}
