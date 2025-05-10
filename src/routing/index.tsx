import { createBrowserRouter } from "react-router-dom"
import App from "@/App.tsx"
import MarketData from "@/views/MarketData/MarketData.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/market-data",
    element: <MarketData />,
  },
])

export default router
