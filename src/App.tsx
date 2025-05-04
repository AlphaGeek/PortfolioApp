import "./App.css"
import AppHeader from "@/components/AppHeader/AppHeader"
import MarketData from "./views/MarketData/MarketData"
import { useSelector } from "react-redux"

function App() {
  const symbol = useSelector((state: any) => state.marketData.symbol)
  return (
    <div className="app bg-cover bg-no-repeat bg-center h-screen bg-[#f5f5f5]">
      <AppHeader />
      <div className="app-content">
        {symbol && symbol.trim().length > 0 && <MarketData symbol={symbol} />}
      </div>
    </div>
  )
}

export default App
