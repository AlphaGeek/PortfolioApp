import { useState } from "react"
import { useEffect } from "react"
import Highcharts from "highcharts"
import { useSelector } from "react-redux"
import HighchartsReact from "highcharts-react-official"
import MarketDataApi from "@/api/marketData"
import { useNavigate } from "react-router-dom"
import Widget from "@/components/Widget/Widget"
import Papa from "papaparse"
import moment from "moment"

function PriceChart(props: any) {
  const navigate = useNavigate()
  const timeSeriesChart = useSelector(
    (state: any) => state.charts.timeSeriesChart
  )
  const [chartOptions, setChartOptions] = useState(timeSeriesChart)
  const [chartData, setChartData] = useState<number[][] | null>(null)

  useEffect(() => {
    if (!props?.symbol) {
      navigate("/")
    }
    MarketDataApi.getTimeSeriesWeekly(props.symbol).then(async (response) => {
      const rawData = response["Weekly Adjusted Time Series"]
      if (!rawData) {
        return
      }
      const seriesData = Object.keys(rawData).map((key) => [
        new Date(key).getTime(),
        parseFloat(rawData![key]["4. close"]),
      ])

      const newOptions = {
        ...timeSeriesChart,
        series: [
          {
            type: "area",
            name: props.symbol,
            data: seriesData,
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
      setChartData(seriesData)
    })
  }, [props.symbol, props.title, props.xAxisTitle, props.yAxisTitle])

  const chart = (
    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
  )

  const settings = [
    {
      label: "Export",
      icon: "pi pi-file-export",
      command: () => {
        if (!chartData) {
          return
        }
        const formattedData = chartData.map((data) => [
          moment(data[0]).format("YYYY-MM-DD"),
          data[1],
        ])
        const csv = Papa.unparse(formattedData)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", "data.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },
    },
  ]

  return (
    <Widget
      headerLeft="Price Chart"
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
