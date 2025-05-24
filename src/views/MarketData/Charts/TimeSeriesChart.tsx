import { useState } from "react"
import { useEffect } from "react"
import "./TimeSeriesChart.scss"
import * as Highcharts from "highcharts"
import { useSelector } from "react-redux"
import HighchartsReact from "highcharts-react-official"
import MarketDataApi from "@/api/marketData"
import { useNavigate } from "react-router-dom"
import Widget from "@/components/Widget/Widget"

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
        },
        yAxis: {
          title: {
            text: props.yAxisTitle || "",
          },
        },
      }
      setChartOptions(newOptions)
    })
  }, [props.symbol, props.title, props.xAxisTitle, props.yAxisTitle])
  const chart = (
    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
  )
  const settings = [
    {
      label: "Save",
      icon: "pi pi-fw pi-plus",
      command: () => {},
    },
    {
      label: "Delete",
      icon: "pi pi-fw pi-trash",
      command: () => {},
    },
  ]
  return (
    <Widget
      headerLeft="This is a chart"
      headerCenter="Center"
      headerRight="Right"
      content={chart}
      minWidth="33vw"
      maxWidth="33vw"
      minHeight="300px"
      maxHeight="600px"
      settings={settings}
    ></Widget>
  )
}

export default PriceChart
