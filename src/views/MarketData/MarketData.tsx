import TimeSeriesChart from "./Charts/TimeSeriesChart"
import { useSelector } from "react-redux"

function MarketData() {
  const priceData = useSelector((state: any) => state.marketData.priceData)
  return (
    <div>
      {priceData && priceData.length > 0 && (
        <TimeSeriesChart title="" chartData={priceData} />
      )}
    </div>
  )
}

export default MarketData
