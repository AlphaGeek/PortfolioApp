import { useState } from "react"
import portfolioApi, { TradeRequest } from "@/api/portfolioApi"
import { Btn, SectionLabel, fmtUSD } from "@/components/glass/Glass"
import Icon from "@/components/glass/Icon"

/* FinAI — glass trade ticket. Same submit logic / fields as the original
   TradeForm; presentation swapped to the glass modal. */
export default function TradeForm({
  portfolioId, defaultSymbol = "", defaultSide = "BUY", defaultPrice, onSuccess, onCancel,
}: {
  portfolioId: number
  defaultSymbol?: string
  defaultSide?: "BUY" | "SELL"
  defaultPrice?: number | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [side, setSide] = useState<"BUY" | "SELL">(defaultSide)
  const [shares, setShares] = useState("100")
  const [price, setPrice] = useState(defaultPrice != null ? String(defaultPrice) : "")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const numShares = parseFloat(shares) || 0
  const pxNum = parseFloat(price) || 0
  const est = numShares * pxNum

  async function submit() {
    setError(null)
    if (!symbol.trim()) { setError("Enter a symbol"); return }
    if (numShares <= 0) { setError("Enter a positive share quantity"); return }
    if (pxNum <= 0) { setError("Enter a price"); return }
    setSubmitting(true)
    const req: TradeRequest = { symbol: symbol.trim().toUpperCase(), side, numShares, price: pxNum }
    try {
      await portfolioApi.placeTrade(portfolioId, req)
      setSubmitting(false)
      onSuccess()
    } catch (e: any) {
      setSubmitting(false)
      setError(e?.message || "Trade failed. Please try again.")
    }
  }

  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="gg-glass gg-glass-inset"
        style={{ borderRadius: 22, padding: 24, width: 400, maxWidth: "100%", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, font: "var(--text-h3)" }}>Trade ticket</h3>
          <button onClick={onCancel} style={{ color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer" }}><Icon name="x" size={20} /></button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
          {(["BUY", "SELL"] as const).map((s) => (
            <button key={s} onClick={() => setSide(s)} className="gg-transition"
              style={{ height: 40, borderRadius: 12, fontWeight: 700, fontSize: 14, border: "1px solid", cursor: "pointer",
                borderColor: side === s ? (s === "BUY" ? "var(--up)" : "var(--down)") : "var(--border)",
                color: side === s ? (s === "BUY" ? "var(--up)" : "var(--down)") : "var(--muted-foreground)",
                background: side === s ? `color-mix(in oklch, ${s === "BUY" ? "var(--up)" : "var(--down)"} 14%, transparent)` : "transparent" }}>
              {s}</button>
          ))}
        </div>

        <div className="filter-field" style={{ marginBottom: 12 }}>
          <SectionLabel>Symbol</SectionLabel>
          <input value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="AAPL"
            className="fin-input" style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div className="filter-field">
            <SectionLabel>Shares</SectionLabel>
            <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} className="fin-input"
              style={{ fontFamily: "var(--font-mono)" }} />
          </div>
          <div className="filter-field">
            <SectionLabel>Price</SectionLabel>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
              className="fin-input" style={{ fontFamily: "var(--font-mono)" }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "6px 0 14px" }}>
          <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>Estimated {side === "BUY" ? "cost" : "proceeds"}</span>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{fmtUSD(est, 2)}</span>
        </div>

        {error && <div style={{ color: "var(--down)", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <Btn kind="primary" onClick={submit} disabled={submitting}
          style={{ width: "100%", height: 46, justifyContent: "center", fontSize: 15,
            background: side === "BUY" ? "var(--up)" : "var(--down)", color: "#fff" }}>
          {submitting ? "Placing…" : side === "BUY" ? "Place buy order" : "Place sell order"}</Btn>
      </div>
    </div>
  )
}
