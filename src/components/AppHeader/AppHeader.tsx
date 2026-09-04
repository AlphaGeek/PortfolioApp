import "./AppHeader.scss"
import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { NavLink } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import jwt_decode from "jwt-decode"
import * as localforage from "localforage"
import SearchBox from "@/components/Search/SearchBox"
import Icon from "@/components/glass/Icon"
import { applyTheme, initialTheme } from "@/lib/theme"
import {
  setIsAuthenticated,
  setJwtToken,
  setUserInfo,
} from "@/store/slices/userSlice"
import { fetchPortfolio, createPortfolio } from "@/store/slices/portfolioSlice"

/* FinAI — glass top nav. Same auth / search / portfolio logic as before;
   only the presentation changed. */

function Mark() {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" aria-hidden>
      <defs>
        <linearGradient id="fm-bg" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1b2330" /><stop offset="1" stopColor="#0c0f15" />
        </linearGradient>
        <linearGradient id="fm-gem" x1="20" y1="14" x2="44" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7cc6ff" /><stop offset="0.5" stopColor="#2a8cff" /><stop offset="1" stopColor="#5be0d0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#fm-bg)" />
      <rect x="4.5" y="4.5" width="55" height="55" rx="15.5" stroke="#fff" strokeOpacity="0.16" />
      <path d="M32 15 L46 32 L39 32 L39 46 L25 46 L25 32 L18 32 Z" fill="url(#fm-gem)" />
      <path d="M32 15 L18 32 L25 32 L32 24 Z" fill="#fff" fillOpacity="0.22" />
    </svg>
  )
}

const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 13px", borderRadius: 99,
  fontSize: 13.5, fontWeight: 500, color: isActive ? "var(--accent)" : "var(--muted-foreground)",
  background: isActive ? "color-mix(in oklch, var(--accent) 14%, transparent)" : "transparent",
})

export default function AppHeader() {
  const isAuthenticated = useSelector((s: any) => s.user.isAuthenticated)
  const user = useSelector((s: any) => s.user.userInfo)
  const portfolio = useSelector((s: any) => s.portfolio.portfolio)
  const portfolioLoaded = useSelector((s: any) => s.portfolio.loaded)
  const dispatch = useDispatch<any>()

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchPortfolio())
  }, [isAuthenticated])

  function onSuccess(response: any) {
    const u = jwt_decode(response.credential)
    localforage.setItem("portfolio-token", response.credential)
    dispatch(setJwtToken(response.credential))
    dispatch(setUserInfo(u))
    dispatch(setIsAuthenticated(true))
  }
  const onError = () => console.error("Google: Failed to sign in")
  function logout() { localforage.removeItem("portfolio-login"); window.location.reload() }
  function handleCreatePortfolio() { dispatch(createPortfolio()) }

  const [dark, setDark] = useState(true)
  useEffect(() => { setDark(initialTheme() === "dark") }, [])
  function toggleTheme() {
    const next = !dark
    setDark(next)
    applyTheme(next ? "dark" : "light")
  }

  return (
    <header className="finai-header">
      <div className="gg-glass gg-glass-inset finai-header-bar">
        {/* brand */}
        <NavLink to="/" className="finai-brand">
          <Mark />
          <span className="finai-brand-text">
            <span className="finai-brand-name">FinAI</span>
            <span className="label finai-brand-sub">Quant Terminal</span>
          </span>
        </NavLink>

        {/* nav */}
        <nav className="finai-nav">
          <NavLink to="/" end style={linkStyle}>Macro</NavLink>
          {isAuthenticated && portfolioLoaded && !portfolio && (
            <button className="finai-create-pf" onClick={handleCreatePortfolio}>+ Create portfolio</button>
          )}
          {portfolio && <NavLink to="/portfolio" style={linkStyle}>Portfolio</NavLink>}
          <NavLink to="/screener" style={linkStyle}>Screener</NavLink>
          <NavLink to="/advisor" style={linkStyle}>Advisor</NavLink>
        </nav>

        {/* search (existing component, glass-themed via AppHeader.scss) */}
        <div className="finai-search-wrap">
          <SearchBox />
        </div>

        {/* market status + account */}
        <div className="finai-header-right">
          <div className="conn-pill">
            <span className="gg-live-dot finai-dot" />
            <span>Market open</span>
          </div>
          <button className="finai-theme-toggle gg-transition" onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title="Toggle theme">
            <Icon name={dark ? "sun" : "moon"} size={16} />
          </button>
          {isAuthenticated ? (
            <div className="finai-user">
              {user?.picture
                ? <img src={user.picture} alt={user?.name || "user"} className="finai-avatar" />
                : <span className="finai-avatar finai-avatar-fallback">{(user?.name || "U").slice(0, 1)}</span>}
              <button id="logout" className="finai-logout" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <GoogleLogin onSuccess={onSuccess} onError={onError} text="signin" shape="pill" />
          )}
        </div>
      </div>
    </header>
  )
}
