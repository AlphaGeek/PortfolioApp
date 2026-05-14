import { useRef, useCallback } from "react"
import Highcharts from "highcharts"
import SpChart from "./SpChart"
import FredChart from "./FredChart"
import "./Home.css"

export default function Home() {
  const chartInstances = useRef<(Highcharts.Chart | null)[]>([])
  const syncing = useRef(false)

  const registerChart = useCallback((index: number, chart: Highcharts.Chart) => {
    chartInstances.current[index] = chart
  }, [])

  const syncExtremes = useCallback(
    (sourceIndex: number, e: Highcharts.AxisSetExtremesEventObject) => {
      if (syncing.current || (e as any).trigger === "syncExtremes") return
      syncing.current = true
      chartInstances.current.forEach((chart, i) => {
        if (i !== sourceIndex && chart) {
          chart.xAxis[0].setExtremes(e.min, e.max, true, false, {
            trigger: "syncExtremes",
          })
        }
      })
      syncing.current = false
    },
    []
  )

  return (
    <div className="home">
      <div className="app-content">
        <SpChart
          onRegister={(chart) => registerChart(0, chart)}
          onExtremesChange={(e) => syncExtremes(0, e)}
        />
        <FredChart
          seriesId="UNRATE"
          title="Unemployment Rate"
          yAxisTitle="Rate (%)"
          onRegister={(chart) => registerChart(1, chart)}
          onExtremesChange={(e) => syncExtremes(1, e)}
        />
        <FredChart
          seriesId="STICKCPIM157SFRBATL"
          title="Sticky Price CPI"
          yAxisTitle="% Change"
          onRegister={(chart) => registerChart(2, chart)}
          onExtremesChange={(e) => syncExtremes(2, e)}
        />
      </div>
    </div>
  )
}
