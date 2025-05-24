import TimeSeriesChart from "./Charts/TimeSeriesChart"
import StockChart from "./Charts/StockChart"
import { useParams } from "react-router-dom"
function MarketData() {
  const { symbol } = useParams()
  return (
    <>
      <div className="flex flex-row flex-wrap justify-start items-center gap-2 p-4">
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
