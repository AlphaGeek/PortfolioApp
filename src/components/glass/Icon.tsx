/* ════════════════════════════════════════════════════════════════════
   FinAI — tiny dependency-free icon set (Lucide-style stroke glyphs).
   Avoids adding a runtime icon library. <Icon name="search" size={16}/>
   ════════════════════════════════════════════════════════════════════ */
import React from "react"

const P: Record<string, React.ReactNode> = {
  search:      <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>,
  plus:        <><path d="M5 12h14" /><path d="M12 5v14" /></>,
  x:           <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>,
  calendar:    <><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" /></>,
  download:    <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></>,
  bookmark:    <><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></>,
  play:        <><polygon points="6 3 20 12 6 21 6 3" /></>,
  zap:         <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
  sparkles:    <><path d="M9.94 14.34A2 2 0 0 0 8.66 13L3 11l5.66-2A2 2 0 0 0 9.94 7.66L12 2l2.06 5.66A2 2 0 0 0 15.34 9L21 11l-5.66 2a2 2 0 0 0-1.28 1.34L12 20z" /></>,
  "arrow-up":  <><path d="M12 19V5M5 12l7-7 7 7" /></>,
  "arrow-up-right": <><path d="M7 7h10v10M7 17 17 7" /></>,
  "chevron-down": <><path d="m6 9 6 6 6-6" /></>,
  "file-text": <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5M9 13h6M9 17h6" /></>,
  "file-search": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" /><path d="M14 2v5h5" /><circle cx="16.5" cy="16.5" r="2.5" /><path d="m20 20-1.1-1.1" /></>,
  sliders:     <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></>,
  activity:    <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
  wallet:      <><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5" /><path d="M18 12a1 1 0 0 0 0 2h2v-2z" /></>,
  "trending-up":   <><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></>,
  info:        <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  sun:         <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" /></>,
  moon:        <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" /></>,
  "line-chart": <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></>,
  lock:        <><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
}

export default function Icon({ name, size = 18, strokeWidth = 2, style, className }:
  { name: string; size?: number; strokeWidth?: number; style?: React.CSSProperties; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round"
      strokeLinejoin="round" style={style} className={className}>
      {P[name] || null}
    </svg>
  )
}
