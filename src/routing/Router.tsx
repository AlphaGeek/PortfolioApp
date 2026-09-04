import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import Home from "@/views/Home/Home"
import MarketData from "@/views/MarketData/MarketData"
import Login from "@/views/Login/Login"
import PortfolioPage from "@/views/Portfolio/PortfolioPage"
import ResearchView from "@/views/Research/ResearchView"
import ScreenerView from "@/views/Screener/ScreenerView"
import PortfolioAdvisor from "@/views/PortfolioAdvisor/PortfolioAdvisor"
import AppHeader from "@/components/AppHeader/AppHeader"

/* FinAI — routing. Unchanged routes; the only addition is the
   <main className="finai-main"> wrapper that gives every page its
   max-width, padding and scroll container under the glass header. */
export default function Router() {
  const Layout = () => (
    <>
      <AppHeader />
      <main className="finai-main gg-scroll">
        <Outlet />
      </main>
      <footer style={{ padding: "18px 26px", borderTop: "1px solid var(--border)", display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 11.5, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>
          FinAI · Quant Terminal · Data delayed · Not investment advice
        </span>
        <span style={{ fontSize: 11.5, color: "var(--muted-foreground)" }}>
          Grinold-Kahn factor model
        </span>
      </footer>
    </>
  )

  const BrowserRoutes = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/",                    element: <Home /> },
        { path: "/login",               element: <Login /> },
        { path: "/market-data/:symbol", element: <MarketData /> },
        { path: "/portfolio",           element: <PortfolioPage /> },
        { path: "/research/:symbol",    element: <ResearchView /> },
        { path: "/screener",            element: <ScreenerView /> },
        { path: "/advisor",             element: <PortfolioAdvisor /> },
      ],
    },
  ])

  return <RouterProvider router={BrowserRoutes} />
}
