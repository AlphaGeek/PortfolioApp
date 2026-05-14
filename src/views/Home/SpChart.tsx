import { useState, useEffect, useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import marketDataApi from "@/api/marketDataApi"
import { useSelector } from "react-redux"

const TEN_YEARS_MS = 10 * 365.25 * 24 * 3600 * 1000

interface SpChartProps {
  onRegister: (chart: Highcharts.Chart) => void
  onExtremesChange: (e: Highcharts.AxisSetExtremesEventObject) => void
}

export default function SpChart({ onRegister, onExtremesChange }: SpChartProps) {
  const baseChart = useSelector((state: any) => state.charts.timeSeriesChart)
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(null)
  const syncRef = useRef(onExtremesChange)

  useEffect(() => { syncRef.current = onExtremesChange }, [onExtremesChange])

  useEffect(() => {
    marketDataApi.getFredSeries("SP500").then((data) => {
      const minDate = Date.now() - TEN_YEARS_MS
      const seriesData: [number, number][] = data
        .map(([date, value]): [number, number] => [new Date(date).getTime(), value])
        .filter(([ts]) => ts >= minDate)

      setChartOptions({
        ...baseChart,
        chart: { ...baseChart.chart, height: "380px" },
        title: { text: "" },
        xAxis: {
          ...baseChart.xAxis,
          min: minDate,
          max: Date.now(),
          events: {
            afterSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => syncRef.current(e),
          },
        },
        yAxis: { title: { text: "Price (USD)" } },
        tooltip: { valuePrefix: "$", valueDecimals: 2 },
        series: [{ type: "area", name: "S&P 500", data: seriesData }],
      })
    })
  }, [])

  if (!chartOptions) return <div className="chart-loading">Loading S&P 500…</div>

  return (
    <div className="home-chart-panel">
      <div className="home-chart-header">S&amp;P 500 — 10 Year</div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        callback={onRegister}
      />
    </div>
  )
}
