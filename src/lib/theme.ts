/* FinAI — theme helper (kept standalone to avoid circular imports). */
export const THEME_KEY = "finai-theme"

export function applyTheme(theme: "dark" | "light") {
  document.documentElement.classList.toggle("dark", theme === "dark")
  try { localStorage.setItem(THEME_KEY, theme) } catch {}
}

export function initialTheme(): "dark" | "light" {
  try { return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark" } catch { return "dark" }
}
