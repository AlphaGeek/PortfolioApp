import "./App.css"
import AppHeader from "./components/AppHeader/AppHeader"
import MarketData from "./views/MarketData/MarketData"
import { useSelector } from "react-redux"

function App() {
  const symbol = useSelector((state: any) => state.marketData.symbol)
  return (
    <div className="app">
      <AppHeader />
      <div className="app-content">
        {symbol && symbol.trim().length > 0 && <MarketData symbol="" />}
      </div>
    </div>
  )
}

export default App
