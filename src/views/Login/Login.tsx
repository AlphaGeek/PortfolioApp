import { useNavigate } from "react-router-dom"
import { Panel, Btn } from "@/components/glass/Glass"
import Icon from "@/components/glass/Icon"

/* FinAI — glass gate. Shown when a route needs auth. Sign-in itself lives in
   the header (Google one-tap); this just explains why and points back. */
export default function Login() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Panel style={{ maxWidth: 440, width: "100%", textAlign: "center", padding: 36 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, margin: "0 auto 18px", display: "flex",
          alignItems: "center", justifyContent: "center", color: "var(--accent)",
          background: "color-mix(in oklch, var(--accent) 14%, transparent)",
          border: "1px solid color-mix(in oklch, var(--accent) 30%, transparent)" }}>
          <Icon name="lock" size={24} />
        </div>
        <h2 style={{ font: "var(--text-h3)", margin: "0 0 8px" }}>Sign in required</h2>
        <p className="lead" style={{ fontSize: 14.5, marginBottom: 22 }}>
          This action needs an account. Use <b style={{ color: "var(--foreground)" }}>Sign in</b> in the top-right to continue with Google.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn kind="ghost" icon="arrow-up-right" onClick={() => navigate("/")}>Back to Macro</Btn>
          <Btn kind="primary" icon="sliders" onClick={() => navigate("/screener")}>Open screener</Btn>
        </div>
      </Panel>
    </div>
  )
}
