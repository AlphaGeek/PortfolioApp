/* ════════════════════════════════════════════════════════════════════
   FinAI — SVG chart primitives (TSX). Dependency-free, theme-aware.
   AreaChart, Sparkline, Donut, FactorBar, ScoreChip, CandleChart, EpsBars.
   ════════════════════════════════════════════════════════════════════ */
import React, { useState, useRef, useId } from "react"

function niceExtent(arr: number[], pad = 0.08): [number, number] {
  if (!arr.length) return [0, 1]
  let lo = Math.min(...arr), hi = Math.max(...arr)
  if (lo === hi) { lo -= 1; hi += 1 }
  const span = hi - lo
  return [lo - span * pad, hi + span * pad]
}
function buildPath(data: number[], w: number, h: number, pad = 0) {
  const [lo, hi] = niceExtent(data)
  const n = data.length
  const x = (i: number) => pad + (i / (n - 1)) * (w - pad * 2)
  const y = (v: number) => h - ((v - lo) / (hi - lo)) * h
  let d = ""
  data.forEach((v, i) => { d += (i === 0 ? "M" : "L") + x(i).toFixed(1) + " " + y(v).toFixed(1) + " " })
  return { line: d.trim(), x, y, lo, hi }
}

export function rampColor(v: number) {
  if (v >= 75) return "var(--chart-3)"
  if (v >= 55) return "var(--chart-2)"
  if (v >= 40) return "var(--chart-1)"
  if (v >= 25) return "var(--chart-4)"
  return "var(--chart-5)"
}

export function AreaChart({ data, color = "var(--accent)", height = 160, labels = null, fmt = (v: number) => String(v), fill = true }:
  { data: number[]; color?: string; height?: number; labels?: string[] | null; fmt?: (v: number) => string; fill?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  if (!data || data.length < 2) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: 12 }}>No data</div>
  const gid = useId().replace(/:/g, "")
  const W = 600, H = height
  const { line, x, y } = buildPath(data, W, H, 2)
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${H} L ${x(0).toFixed(1)} ${H} Z`
  function onMove(e: React.MouseEvent) {
    const r = wrapRef.current!.getBoundingClientRect()
    const rel = (e.clientX - r.left) / r.width
    const i = Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1))))
    setHover(i)
  }
  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {fill && <path d={area} fill={`url(#g${gid})`} />}
        <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        {hover != null && (
          <g>
            <line x1={x(hover)} y1="0" x2={x(hover)} y2={H} stroke="var(--foreground)" strokeOpacity="0.18" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={x(hover)} cy={y(data[hover])} r="3.5" fill={color} stroke="var(--card)" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover != null && (
        <div style={{ position: "absolute", top: 4, left: `${(hover / (data.length - 1)) * 100}%`, transform: "translateX(-50%)",
          pointerEvents: "none", background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8,
          padding: "4px 8px", fontSize: 11, whiteSpace: "nowrap", fontFamily: "var(--font-mono)", boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}>
          <span style={{ fontWeight: 600 }}>{fmt(data[hover])}</span>
          {labels && <span style={{ opacity: 0.6, marginLeft: 6 }}>{labels[hover]}</span>}
        </div>
      )}
    </div>
  )
}

export function Sparkline({ data, color = "var(--accent)", w = 96, h = 28, fill = false }:
  { data: number[]; color?: string; w?: number; h?: number; fill?: boolean }) {
  const gid = useId().replace(/:/g, "")
  if (!data || data.length < 2) return <svg width={w} height={h} />
  const { line, x } = buildPath(data, w, h, 1)
  const area = `${line} L ${x(data.length - 1).toFixed(1)} ${h} L ${x(0).toFixed(1)} ${h} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`s${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#s${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export type Slice = { value: number; color: string; label?: string }
export function Donut({ slices, size = 168, thickness = 22, hovered = null, onHover = () => {} }:
  { slices: Slice[]; size?: number; thickness?: number; hovered?: number | null; onHover?: (i: number | null) => void }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 4, ri = r - thickness
  const p2 = (a: number, rad: number): [number, number] => { const t = (a - 90) * Math.PI / 180; return [cx + rad * Math.cos(t), cy + rad * Math.sin(t)] }
  let cum = 0
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const ang = (s.value / total) * 360
        const start = cum; cum += ang; const end = cum
        const big = ang > 180 ? 1 : 0
        const [s1x, s1y] = p2(start, r), [e1x, e1y] = p2(end, r)
        const [s2x, s2y] = p2(end, ri), [e2x, e2y] = p2(start, ri)
        const d = `M ${s1x} ${s1y} A ${r} ${r} 0 ${big} 1 ${e1x} ${e1y} L ${s2x} ${s2y} A ${ri} ${ri} 0 ${big} 0 ${e2x} ${e2y} Z`
        return <path key={i} d={d} fill={s.color} opacity={hovered == null || hovered === i ? 0.95 : 0.4}
          stroke="var(--card)" strokeWidth="1.5" style={{ transition: "opacity .2s", cursor: "pointer" }}
          onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)} />
      })}
    </svg>
  )
}

export function FactorBar({ value, width = 64, showNum = true }: { value: number; width?: number; showNum?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width, height: 6, borderRadius: 99, background: "var(--muted)", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", borderRadius: 99, background: rampColor(value), transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
      {showNum && <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
        color: "var(--muted-foreground)", minWidth: 22, textAlign: "right" }}>{Math.round(value)}</span>}
    </div>
  )
}

export function ScoreChip({ value }: { value: number }) {
  const c = rampColor(value)
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 30, height: 22,
    padding: "0 7px", borderRadius: 7, fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: c,
    background: `color-mix(in oklch, ${c} 16%, transparent)` }}>{Math.round(value)}</span>
}

export type Candle = { o: number; h: number; l: number; c: number; v?: number }
export function CandleChart({ candles, height = 320 }: { candles: Candle[]; height?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hi, setHi] = useState<number | null>(null)
  const W = 760, H = height, padB = 26, padR = 4
  const highs = candles.map((c) => c.h), lows = candles.map((c) => c.l)
  const lo = Math.min(...lows), top = Math.max(...highs)
  const y = (v: number) => (H - padB) - ((v - lo) / (top - lo)) * (H - padB - 8) + 4
  const n = candles.length
  const cw = (W - padR) / n
  const bw = Math.max(2, cw * 0.62)
  function onMove(e: React.MouseEvent) {
    const r = wrapRef.current!.getBoundingClientRect()
    const i = Math.max(0, Math.min(n - 1, Math.floor(((e.clientX - r.left) / r.width) * n)))
    setHi(i)
  }
  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }} onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const v = lo + (top - lo) * t
          return <g key={i}>
            <line x1="0" x2={W} y1={y(v)} y2={y(v)} stroke="var(--foreground)" strokeOpacity="0.06" strokeWidth="1" />
            <text x={W - 2} y={y(v) - 3} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--muted-foreground)">{v.toFixed(1)}</text>
          </g>
        })}
        {candles.map((c, i) => {
          const cx = i * cw + cw / 2
          const rising = c.c >= c.o
          const col = rising ? "var(--up)" : "var(--down)"
          const yo = y(c.o), yc = y(c.c)
          return <g key={i} opacity={hi == null || hi === i ? 1 : 0.55}>
            <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" />
            <rect x={cx - bw / 2} y={Math.min(yo, yc)} width={bw} height={Math.max(1, Math.abs(yc - yo))} fill={col} rx="0.5" />
          </g>
        })}
        {hi != null && <line x1={hi * cw + cw / 2} x2={hi * cw + cw / 2} y1="0" y2={H - padB} stroke="var(--foreground)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />}
      </svg>
      {hi != null && (() => {
        const c = candles[hi]
        return <div style={{ position: "absolute", top: 6, left: 8, pointerEvents: "none", display: "flex", gap: 12,
          fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--popover)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "5px 10px", boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}>
          <span style={{ opacity: 0.6 }}>O <b style={{ color: "var(--foreground)" }}>{c.o}</b></span>
          <span style={{ opacity: 0.6 }}>H <b style={{ color: "var(--foreground)" }}>{c.h}</b></span>
          <span style={{ opacity: 0.6 }}>L <b style={{ color: "var(--foreground)" }}>{c.l}</b></span>
          <span style={{ opacity: 0.6 }}>C <b style={{ color: c.c >= c.o ? "var(--up)" : "var(--down)" }}>{c.c}</b></span>
        </div>
      })()}
    </div>
  )
}

export function EpsBars({ history, height = 120 }: { history: { date: string; eps: number }[]; height?: number }) {
  const vals = history.map((h) => h.eps)
  const max = Math.max(...vals.map(Math.abs), 0.01)
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: height + 30, paddingTop: 18 }}>
      {history.map((h, i) => {
        const hgt = Math.abs(h.eps) / max * height
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>
              {h.eps >= 0 ? "" : "-"}${Math.abs(h.eps).toFixed(2)}</span>
            <div style={{ width: "70%", height: hgt, borderRadius: "4px 4px 0 0",
              background: "linear-gradient(180deg, var(--accent), color-mix(in oklch, var(--accent) 55%, transparent))" }} />
            <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{h.date.slice(2)}</span>
          </div>
        )
      })}
    </div>
  )
}
