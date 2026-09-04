import "./App.css"
import { useEffect } from "react"
import Router from "./routing/Router"
import { Background } from "./components/glass/Glass"
import { applyTheme, initialTheme } from "./lib/theme"

/* FinAI — Glass UI shell. Applies the saved theme (dark by default), mounts
   the ambient background, then hands off to the existing Router. */
export default function App() {
  useEffect(() => { applyTheme(initialTheme()) }, [])

  return (
    <div className="finai-app">
      <Background />
      <div className="finai-content">
        <Router />
      </div>
    </div>
  )
}
