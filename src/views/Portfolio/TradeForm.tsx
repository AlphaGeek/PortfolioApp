import { useState } from "react"
import portfolioApi, { TradeRequest } from "@/api/portfolioApi"
import "./Portfolio.css"

interface TradeFormProps {
  portfolioId: number
  defaultSymbol?: string
  defaultSide?: 'BUY' | 'SELL'
  onSuccess: () => void
  onCancel: () => void
}

export default function TradeForm({
  portfolioId,
  defaultSymbol = "",
  defaultSide = "BUY",
  onSuccess,
  onCancel,
}: TradeFormProps) {
  const [symbol, setSymbol] = useState(defaultSymbol.toUpperCase())
  const [side, setSide] = useState<'BUY' | 'SELL'>(defaultSide)
  const [numShares, setNumShares] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const trade: TradeRequest = {
      symbol: symbol.trim().toUpperCase(),
      side,
      numShares: parseFloat(numShares),
      price: parseFloat(price),
    }

    if (!trade.symbol || isNaN(trade.numShares) || isNaN(trade.price)) {
      setError("All fields are required.")
      return
    }

    setLoading(true)
    try {
      await portfolioApi.placeTrade(portfolioId, trade)
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trade-form-overlay" onClick={onCancel}>
      <div className="trade-form" onClick={(e) => e.stopPropagation()}>
        <h3 className="trade-form-title">Place Trade</h3>

        <div className="trade-side-toggle">
          <button
            type="button"
            className={`side-btn buy-btn ${side === "BUY" ? "active" : ""}`}
            onClick={() => setSide("BUY")}
          >
            BUY
          </button>
          <button
            type="button"
            className={`side-btn sell-btn ${side === "SELL" ? "active" : ""}`}
            onClick={() => setSide("SELL")}
          >
            SELL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="trade-form-fields">
          <label>
            Symbol
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              autoFocus={!defaultSymbol}
            />
          </label>

          <label>
            Shares
            <input
              type="number"
              min="0.000001"
              step="any"
              value={numShares}
              onChange={(e) => setNumShares(e.target.value)}
              placeholder="0"
            />
          </label>

          <label>
            Price per Share ($)
            <input
              type="number"
              min="0.01"
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </label>

          {error && <div className="trade-error">{error}</div>}

          <div className="trade-form-actions">
            <button type="button" className="trade-cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className={`trade-submit-btn ${side === "BUY" ? "buy" : "sell"}`}
              disabled={loading}
            >
              {loading ? "Executing…" : `${side} ${symbol || "—"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
