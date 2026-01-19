//import TimeSeriesChart from "./Charts/TimeSeriesChart"
import { useState, useEffect } from "react"
import TradingChart from "./Charts/AdvancedTradingChart"
import MarketDataApi from "../../api/marketDataApi"
import AskAI from "./AI/AskAI"
import { useParams } from "react-router-dom"
import { CandlestickData, Time } from "lightweight-charts"

function MarketData() {
  const [dailyTimeSeriesData, setDailyTimeSeriesData] = useState<CandlestickData<Time>[]>([])
  const { symbol } = useParams()

  useEffect(() => {
    if (symbol) {
      MarketDataApi.getTimeSeriesDaily(symbol).then((data) => {
        console.log("data", data)
        setDailyTimeSeriesData(data)
      })
    }
  }, [symbol])

  return (
    <>
      <div className="flex flex-row flex-wrap justify-start items-center p-4">
        {symbol && symbol.trim().length > 0 && (
          <div>
            <TradingChart data={dailyTimeSeriesData} />
            <AskAI />
          </div>
        )}
      </div>
    </>
  )
}

export default MarketData