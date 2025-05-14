import TimeSeriesChart from "./Charts/TimeSeriesChart"
import { useParams } from "react-router-dom"
function MarketData() {
  const { symbol } = useParams()
  console.log("MarketData symbol", symbol)
  return (
    <>
      <div>
        {symbol && symbol.trim().length > 0 && (
          <TimeSeriesChart symbol={symbol} />
        )}
      </div>
    </>
  )
}

export default MarketData
