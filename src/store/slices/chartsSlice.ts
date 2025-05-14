import { createSlice } from '@reduxjs/toolkit';
import * as Highcharts from "highcharts"

const initialState = {
  timeSeriesChart: {
    chart: {
      height: "300px",
      type: "area",
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "",
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
            [0, '#0984e3'],
            [1, '#e6f2fc']
          ]
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

    series: [],
  },
}

export const chartsSlice = createSlice({
  name: 'charts',
  initialState,
  reducers: {}
})

export default chartsSlice.reducer