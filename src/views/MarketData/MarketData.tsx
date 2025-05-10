import TimeSeriesChart from "./Charts/TimeSeriesChart"
import { useSelector } from "react-redux"

function MarketData() {
  const symbol = useSelector((state: any) => state.marketData.company.symbol)

  return (
    <div>
      <h1>Market Data</h1>
      {symbol && <TimeSeriesChart title="" symbol={symbol} />}
    </div>
  )
}

export default MarketData
