import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import portfolioApi, { Holding } from "@/api/portfolioApi"
import TradeForm from "./TradeForm"
import "./Portfolio.css"

export default function PortfolioPage() {
  const portfolio = useSelector((state: any) => state.portfolio.portfolio)
  const portfolioLoaded = useSelector((state: any) => state.portfolio.loaded)
  const navigate = useNavigate()

  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loadingHoldings, setLoadingHoldings] = useState(false)
  const [tradeTarget, setTradeTarget] = useState<{ symbol: string; side: 'BUY' | 'SELL' } | null>(null)

  const loadHoldings = useCallback(async () => {
    if (!portfolio?.portfolioId) return
    setLoadingHoldings(true)
    const data = await portfolioApi.getHoldings(portfolio.portfolioId)
    setHoldings(data)
    setLoadingHoldings(false)
  }, [portfolio?.portfolioId])

  useEffect(() => {
    if (portfolioLoaded && !portfolio) {
      navigate("/")
    } else {
      loadHoldings()
    }
  }, [portfolio, portfolioLoaded])

  function openTrade(symbol = "", side: 'BUY' | 'SELL' = "BUY") {
    setTradeTarget({ symbol, side })
  }

  function onTradeSuccess() {
    setTradeTarget(null)
    loadHoldings()
  }

  if (!portfolioLoaded) {
    return <div className="portfolio-page"><p className="portfolio-loading">Loading…</p></div>
  }

  return (
    <div className="portfolio-page">
      <div className="portfolio-header">
        <div>
          <h2 className="portfolio-title">My Portfolio</h2>
          {portfolio && <p className="portfolio-name">{portfolio.name}</p>}
        </div>
        <button className="new-trade-btn" onClick={() => openTrade("", "BUY")}>
          + New Trade
        </button>
      </div>

      {loadingHoldings ? (
        <p className="portfolio-loading">Loading holdings…</p>
      ) : holdings.length === 0 ? (
        <div className="portfolio-empty">
          <p>No holdings yet.</p>
          <button className="new-trade-btn" onClick={() => openTrade("", "BUY")}>
            Place your first trade
          </button>
        </div>
      ) : (
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Shares</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.symbol}>
                <td className="holding-symbol">{h.symbol}</td>
                <td className="holding-shares">{h.numShares.toLocaleString()}</td>
                <td className="holding-actions">
                  <button className="action-btn buy-action" onClick={() => openTrade(h.symbol, "BUY")}>
                    Buy
                  </button>
                  <button className="action-btn sell-action" onClick={() => openTrade(h.symbol, "SELL")}>
                    Sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tradeTarget && portfolio && (
        <TradeForm
          portfolioId={portfolio.portfolioId}
          defaultSymbol={tradeTarget.symbol}
          defaultSide={tradeTarget.side}
          onSuccess={onTradeSuccess}
          onCancel={() => setTradeTarget(null)}
        />
      )}
    </div>
  )
}
