import { useState, useEffect, useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import marketDataApi from "@/api/marketDataApi"
import { useSelector } from "react-redux"

const TEN_YEARS_MS = 10 * 365.25 * 24 * 3600 * 1000

interface FredChartProps {
  seriesId: string
  title: string
  yAxisTitle?: string
  onRegister: (chart: Highcharts.Chart) => void
  onExtremesChange: (e: Highcharts.AxisSetExtremesEventObject) => void
}

export default function FredChart({
  seriesId,
  title,
  yAxisTitle = "",
  onRegister,
  onExtremesChange,
}: FredChartProps) {
  const baseChart = useSelector((state: any) => state.charts.timeSeriesChart)
  const [chartOptions, setChartOptions] = useState<Highcharts.Options | null>(null)
  const syncRef = useRef(onExtremesChange)

  useEffect(() => { syncRef.current = onExtremesChange }, [onExtremesChange])

  useEffect(() => {
    marketDataApi.getFredSeries(seriesId).then((data) => {
      const minDate = Date.now() - TEN_YEARS_MS
      const seriesData: [number, number][] = data
        .map(([date, value]): [number, number] => [new Date(date).getTime(), value])
        .filter(([ts]) => ts >= minDate)

      setChartOptions({
        ...baseChart,
        chart: { ...baseChart.chart, height: "260px" },
        title: { text: "" },
        xAxis: {
          ...baseChart.xAxis,
          min: minDate,
          max: Date.now(),
          events: {
            afterSetExtremes: (e: Highcharts.AxisSetExtremesEventObject) => syncRef.current(e),
          },
        },
        yAxis: { title: { text: yAxisTitle } },
        tooltip: { valueDecimals: 1 },
        series: [{ type: "area", name: title, data: seriesData }],
      })
    })
  }, [seriesId])

  if (!chartOptions) return <div className="chart-loading">Loading {title}…</div>

  return (
    <div className="home-chart-panel fred-chart-panel">
      <div className="home-chart-header">
        {title}
        <span className="fred-badge">FRED: {seriesId}</span>
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        callback={onRegister}
      />
    </div>
  )
}
