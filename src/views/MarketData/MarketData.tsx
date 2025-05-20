import TimeSeriesChart from "./Charts/TimeSeriesChart"
import StockChart from "./Charts/StockChart"
import { useParams } from "react-router-dom"
function MarketData() {
  const { symbol } = useParams()
  console.log("MarketData symbol", symbol)
  return (
    <>
      <div>
        {symbol && symbol.trim().length > 0 && (
          <div>
            <TimeSeriesChart symbol={symbol} />
            <StockChart symbol={symbol} />
          </div>
        )}
      </div>
    </>
  )
}

export default MarketData
