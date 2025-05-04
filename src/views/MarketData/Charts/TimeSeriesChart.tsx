import * as React from "react"
import { useEffect } from "react"
import "./TimeSeriesChart.scss"
import * as Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import marketDataApi from "@/api/marketData"

function TimeSeriesChart(props: any) {
  
  const [options, setOptions] = React.useState({
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
    setOptions({
      ...options,
      series: [
        {
          type: "area",
          name: props.name,
          data: props.chartData,
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
    })
  }, [
    props.chartData,
    props.title,
    props.xAxisTitle,
    props.yAxisTitle,
    props.name,
    options,
  ])

  return (
    <div className="timeSeriesChartContainer">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

export default TimeSeriesChart
