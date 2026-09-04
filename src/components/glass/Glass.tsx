/* ════════════════════════════════════════════════════════════════════
   FinAI — Glass UI primitives (TSX). Panel, SectionLabel, Delta, Btn,
   PageHead, Background. Pure presentation; no app data.
   ════════════════════════════════════════════════════════════════════ */
import React from "react"
import Icon from "./Icon"

export function Panel({ children, className = "", style = {}, pad = true, onClick }:
  { children: React.ReactNode; className?: string; style?: React.CSSProperties; pad?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`gg-glass gg-glass-inset gg-transition ${className}`}
      style={{ borderRadius: 18, ...(pad ? { padding: "var(--pad)" } : {}), ...style }}>
      {children}
    </div>
  )
}

export function SectionLabel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div className="label" style={{ marginBottom: 2, ...style }}>{children}</div>
}

export function Delta({ value, pct = false, d = 2, suffix = "", invert = false, size = 13, arrow = true }:
  { value: number | null | undefined; pct?: boolean; d?: number; suffix?: string; invert?: boolean; size?: number; arrow?: boolean }) {
  if (value == null) return <span style={{ color: "var(--muted-foreground)" }}>—</span>
  const positive = invert ? value < 0 : value >= 0
  const col = positive ? "var(--up)" : "var(--down)"
  const txt = (value >= 0 ? "+" : "") + value.toFixed(d) + (pct ? "%" : "") + suffix
  return (
    <span style={{ color: col, fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: size,
      display: "inline-flex", alignItems: "center", gap: 3 }}>
      {arrow && <span style={{ fontSize: size - 2 }}>{value >= 0 ? "▲" : "▼"}</span>}{txt}
    </span>
  )
}

type BtnKind = "primary" | "ghost" | "accentGhost"
export function Btn({ children, onClick, kind = "ghost", icon, style = {}, disabled, type = "button" }:
  { children?: React.ReactNode; onClick?: (e?: any) => void; kind?: BtnKind; icon?: string;
    style?: React.CSSProperties; disabled?: boolean; type?: "button" | "submit" }) {
  const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 7, height: 38,
    padding: "0 16px", borderRadius: 99, fontSize: 13.5, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent", opacity: disabled ? 0.5 : 1, fontFamily: "inherit", ...style }
  const kinds: Record<BtnKind, React.CSSProperties> = {
    primary: { background: "var(--accent)", color: "var(--accent-foreground)" },
    ghost: { background: "color-mix(in oklch, var(--foreground) 4%, transparent)",
      border: "1px solid var(--border)", color: "var(--foreground)" },
    accentGhost: { background: "color-mix(in oklch, var(--accent) 12%, transparent)",
      color: "var(--accent)", border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)" },
  }
  return (
    <button type={type} className="gg-transition" onClick={onClick} disabled={disabled} style={{ ...base, ...kinds[kind] }}>
      {icon && <Icon name={icon} size={15} />}{children}
    </button>
  )
}

export function PageHead({ title, subtitle, children }:
  { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20,
      flexWrap: "wrap", marginBottom: 20 }}>
      <div>
        <h2 style={{ font: "var(--text-h2)", letterSpacing: "-0.03em", margin: 0 }}>{title}</h2>
        {subtitle && <p className="lead" style={{ fontSize: 14.5, marginTop: 6, maxWidth: 660 }}>{subtitle}</p>}
      </div>
      {children && <div style={{ display: "flex", gap: 10, alignItems: "center" }}>{children}</div>}
    </div>
  )
}

/* Ambient animated background — orbs + grid mesh. Render once at app root. */
export function Background() {
  return (
    <>
      <div className="gg-grid-mesh" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <div className="finai-bg-orb gg-orb" style={{ top: "-14%", left: "-8%", width: "44vw", height: "44vw",
        filter: "blur(90px)", background: "#0a84ff", opacity: "var(--orb-1)" as any }} />
      <div className="finai-bg-orb gg-orb gg-orb-2" style={{ top: "26%", right: "-10%", width: "40vw", height: "40vw",
        filter: "blur(95px)", background: "#38f9d7", opacity: "var(--orb-2)" as any }} />
      <div className="finai-bg-orb gg-orb gg-orb-3" style={{ bottom: "-18%", left: "22%", width: "38vw", height: "38vw",
        filter: "blur(100px)", background: "#ff7a59", opacity: "var(--orb-3)" as any }} />
    </>
  )
}

/* shared number formatters */
export const fmtUSD = (v: number, d = 0) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
export const fmtNum = (v: number | null | undefined, d = 2) => v == null ? "—" : v.toLocaleString("en-US", { maximumFractionDigits: d })
export const fmtPct = (v: number | null | undefined, d = 1, sign = true) =>
  v == null ? "—" : (sign && v >= 0 ? "+" : "") + v.toFixed(d) + "%"
export const fmtB = (v: number | null | undefined) => {
  if (v == null) return "—"
  const a = Math.abs(v)
  if (a >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T"
  if (a >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B"
  if (a >= 1e6) return "$" + (v / 1e6).toFixed(1) + "M"
  return "$" + v.toLocaleString("en-US")
}
