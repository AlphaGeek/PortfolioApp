import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import Home from "@/views/Home/Home"
import MarketData from "@/views/MarketData/MarketData"
import Login from "@/views/Login/Login"
import AppHeader from "@/components/AppHeader/AppHeader"

export default function Router() {
  const Layout = () => {
    return (
      <>
        <AppHeader />
        <Outlet />
      </>
    )
  }

  const BrowserRoutes = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/market-data",
          element: <MarketData />,
        },
      ],
    },
  ])

  return <RouterProvider router={BrowserRoutes} />
}
