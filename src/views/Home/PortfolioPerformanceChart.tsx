import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"
import pmApi from "@/api/portfolioManagerApi"
import { Panel, SectionLabel, Delta, Btn } from "@/components/glass/Glass"

export default function PortfolioPerformanceChart() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [portfolioId, setPortfolioId] = useState<number | null>(null)
  const [portfolioSeries, setPortfolioSeries] = useState<[number, number][]>([])
  const [benchmarkSeries, setBenchmarkSeries] = useState<[number, number][]>([])

  useEffect(() => {
    (async () => {
      const pf = await pmApi.init()
      if (!pf) { setLoading(false); return }
      setPortfolioId(pf.portfolioId)
      await pmApi.snapshot(pf.portfolioId)
      const perf = await pmApi.getPerformance(pf.portfolioId)
      if (perf) {
        setPortfolioSeries(perf.portfolio.map(([d, v]) => [new Date(d).getTime(), v]))
        setBenchmarkSeries(perf.benchmark.map(([d, v]) => [new Date(d).getTime(), v]))
      }
      setLoading(false)
    })()
  }, [])

  const latestPf = portfolioSeries.length ? portfolioSeries[portfolioSeries.length - 1][1] : null
  const latestBm = benchmarkSeries.length ? benchmarkSeries[benchmarkSeries.length - 1][1] : null
  const pfReturn = latestPf != null ? latestPf - 100 : null
  const bmReturn = latestBm != null ? latestBm - 100 : null
  const delta = pfReturn != null && bmReturn != null ? pfReturn - bmReturn : null

  const options: Highcharts.Options = {
    chart: { height: 320, type: "line", backgroundColor: "transparent" },
    title: { text: "" },
    credits: { enabled: false },
    xAxis: { type: "datetime", labels: { style: { color: "var(--muted-foreground)" } }, lineColor: "var(--border)" },
    yAxis: {
      title: { text: "" },
      labels: { formatter() { return (this.value as number).toFixed(0) }, style: { color: "var(--muted-foreground)" } },
      gridLineColor: "var(--border)",
    },
    legend: { enabled: true, itemStyle: { color: "var(--muted-foreground)", fontWeight: "600" } },
    tooltip: { valueDecimals: 2, xDateFormat: "%b %d, %Y" },
    plotOptions: { line: { marker: { enabled: false }, lineWidth: 2.5 } },
    series: [
      { type: "line", name: "AI Portfolio Manager", data: portfolioSeries, color: "#4c8bf5" },
      { type: "line", name: "S&P 500", data: benchmarkSeries, color: "#8b93a6", dashStyle: "ShortDash" },
    ],
  }

  return (
    <Panel style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10, flexWrap: "wrap" }}>
        <div>
          <SectionLabel>Portfolio Manager vs S&amp;P 500</SectionLabel>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
            {pfReturn != null
              ? <span style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-mono)" }}><Delta value={pfReturn} pct d={2} /></span>
              : <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>No performance history yet</span>}
            {delta != null && (
              <span style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
                {delta >= 0 ? "outperforming" : "underperforming"} S&amp;P 500 by <Delta value={delta} pct d={2} arrow={false} />
              </span>
            )}
          </div>
        </div>
        <Btn kind="ghost" icon="sliders" onClick={() => navigate("/advisor")}>Manage portfolio</Btn>
      </div>

      {loading && <div style={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)" }}>Loading…</div>}
      {!loading && portfolioSeries.length < 2 && (
        <div style={{ height: 320, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 10, color: "var(--muted-foreground)", textAlign: "center" }}>
          <p style={{ maxWidth: 380, fontSize: 13.5 }}>
            Not enough history yet to chart performance. Run the Portfolio Manager from the Advisor page to build
            the initial book — each visit here adds a new data point.
          </p>
          <Btn kind="primary" icon="sparkles" onClick={() => navigate("/advisor")}>Go to Advisor</Btn>
        </div>
      )}
      {!loading && portfolioSeries.length >= 2 && (
        <HighchartsReact highcharts={Highcharts} options={options} />
      )}
    </Panel>
  )
}
