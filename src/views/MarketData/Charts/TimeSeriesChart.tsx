import { useState } from "react"
import { useEffect } from "react"
import "./TimeSeriesChart.scss"
import * as Highcharts from "highcharts"
import { useSelector } from "react-redux"
import HighchartsReact from "highcharts-react-official"
import MarketDataApi from "@/api/marketData"
import { useNavigate } from "react-router-dom"

function PriceChart(props: any) {
  const navigate = useNavigate()
  const timeSeriesChart = useSelector(
    (state: any) => state.charts.timeSeriesChart
  )
  const [chartOptions, setChartOptions] = useState(timeSeriesChart)

  useEffect(() => {
    if (!props?.symbol) {
      navigate("/")
    }
    MarketDataApi.getTimeSeriesWeekly(props.symbol).then(async (response) => {
      const pData = response["Weekly Adjusted Time Series"]
      const chartData = Object.keys(pData).map((key) => [
        new Date(key).getTime(),
        parseFloat(pData[key]["4. close"]),
      ])

      console.log("chart data", chartData)
      const newOptions = {
        ...timeSeriesChart,
        series: [
          {
            type: "area",
            name: props.symbol,
            data: chartData,
          },
        ],
        title: {
          text: props.title || "",
        },
        xAxis: {
          title: {
            text: props.xAxisTitle || "",
          },
          type: "",
          labels: {
            formatter: function (): string {
              return ""
            },
          },
        },
        yAxis: {
          title: {
            text: props.yAxisTitle || "",
          },
        },
      }
      console.log("NEW options", newOptions)
      await setChartOptions(newOptions)
      console.log("chart options", chartOptions)
    })
  }, [props.symbol, props.title, props.xAxisTitle, props.yAxisTitle])

  return (
    <div className="timeSeriesChartContainer">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  )
}

export default PriceChart
