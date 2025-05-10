import { useState } from "react"
import { useEffect } from "react"
import "./TimeSeriesChart.scss"
import * as Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import MarketDataApi from "@/api/marketData"

function TimeSeriesChart(props: any) {
  const [options, setOptions] = useState({
    chart: {
      zoomType: "x",
      height: "57.5vh",
    },
    title: {
      text: props.title || "",
    },
    subtitle: {
      text:
        document.ontouchstart === undefined
          ? "Click and drag in the plot area to zoom in"
          : "Pinch the chart to zoom in",
    },
    xAxis: {
      type: "datetime",
      title: {
        text: props.xAxisTitle || "",
      },
      labels: {
        formatter: function (): string {
          return Highcharts.dateFormat("%Y", (this as any).value)
        },
      },
    },
    yAxis: {
      title: {
        text: "",
      },
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1,
          },
          stops: [
            [0, "#487eb0"],
            [1, "#4cd137"],
          ],
        },
        marker: {
          radius: 2,
        },
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 4,
          },
        },
        threshold: null,
      },
    },

    series: [
      {
        type: "area",
        name: props.label,
        data: props.chartData,
      },
    ],
  })

  useEffect(() => {
    MarketDataApi.getTimeSeriesWeekly(props.symbol).then((response) => {
      const pData = response["Weekly Adjusted Time Series"]
      const chartData = Object.keys(pData).map((key) => [
        new Date(key).getTime(),
        parseFloat(pData[key]["4. close"]),
      ])

      console.log("chart data", chartData)
      const newOptions = {
        ...options,
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
      setOptions(newOptions)
      console.log("chart options", options)
    })
  }, [props.symbol, props.title, props.xAxisTitle, props.yAxisTitle])

  return (
    <div className="timeSeriesChartContainer">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default TimeSeriesChart
