import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import Home from "@/views/Home/Home"
import MarketData from "@/views/MarketData/MarketData"
import Login from "@/views/Login/Login"
import PortfolioPage from "@/views/Portfolio/PortfolioPage"
import ResearchView from "@/views/Research/ResearchView"
import ScreenerView from "@/views/Screener/ScreenerView"
import PortfolioAdvisor from "@/views/PortfolioAdvisor/PortfolioAdvisor"
import AppHeader from "@/components/AppHeader/AppHeader"

export default function Router() {
  const Layout = () => (
    <>
      <AppHeader />
      <Outlet />
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
