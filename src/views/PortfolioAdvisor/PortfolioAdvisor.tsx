import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import researchApi, { AdvisorRecommendation, AdvisorRequest } from '@/api/researchApi'
import './PortfolioAdvisor.css'

type Risk = 'conservative' | 'moderate' | 'aggressive'

const RISK_CONFIG: Record<Risk, { label: string; desc: string; color: string }> = {
  conservative: {
    label: 'Conservative',
    desc: 'Large-cap, low-beta, dividend-paying stocks. Lower drawdown risk.',
    color: '#00b894',
  },
  moderate: {
    label: 'Moderate',
    desc: 'Balanced mix of growth and value. Mid-to-large cap focus.',
    color: '#0984e3',
  },
  aggressive: {
    label: 'Aggressive',
    desc: 'High-momentum, high-growth stocks. Higher volatility and upside.',
    color: '#e17055',
  },
}

function fmt(v: number | null | undefined, d = 2): string {
  if (v == null) return '—'
  return v.toLocaleString(undefined, { maximumFractionDigits: d })
}

function fmtPct(v: number | null | undefined, alreadyPct = false): string {
  if (v == null) return '—'
  const val = alreadyPct ? v : v * 100
  return (val >= 0 ? '+' : '') + val.toFixed(1) + '%'
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 70 ? '#00b894' : value >= 40 ? '#0984e3' : '#e17055'
  return (
    <div className="pick-score-bar">
      <div className="pick-score-fill" style={{ width: `${value}%`, background: color }} />
      <span className="pick-score-num">{value.toFixed(0)}</span>
    </div>
  )
}

function AllocationDonut({ picks }: { picks: AdvisorRecommendation['picks'] }) {
  const COLORS = [
    '#0984e3', '#00b894', '#e17055', '#fdcb6e', '#6c5ce7',
    '#fd79a8', '#00cec9', '#74b9ff', '#55efc4', '#fab1a0',
  ]

  let cumAngle = 0
  const slices = picks.map((p, i) => {
    const angle = p.weight * 360
    const start = cumAngle
    cumAngle += angle
    return { ...p, angle, start, color: COLORS[i % COLORS.length] }
  })

  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 60
  const ri = 38

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function slicePath(startDeg: number, angle: number) {
    if (angle >= 359.9) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r}
              L ${cx - 0.01} ${cy - ri} A ${ri} ${ri} 0 1 0 ${cx} ${cy - ri} Z`
    }
    const endDeg = startDeg + angle
    const s1 = polarToXY(startDeg, r)
    const e1 = polarToXY(endDeg,   r)
    const s2 = polarToXY(endDeg,   ri)
    const e2 = polarToXY(startDeg, ri)
    const lg = angle > 180 ? 1 : 0
    return `M ${s1.x} ${s1.y} A ${r} ${r} 0 ${lg} 1 ${e1.x} ${e1.y}
            L ${s2.x} ${s2.y} A ${ri} ${ri} 0 ${lg} 0 ${e2.x} ${e2.y} Z`
  }

  return (
    <div className="donut-wrap">
      <svg width={size} height={size}>
        {slices.map((s, i) => (
          <path key={i} d={slicePath(s.start, s.angle)} fill={s.color}
            opacity={0.9} stroke="#fff" strokeWidth={1} />
        ))}
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="donut-legend-row">
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="donut-symbol">{s.symbol}</span>
            <span className="donut-weight">{(s.weight * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PortfolioAdvisor() {
  const navigate = useNavigate()
  const [sectors, setSectors]         = useState<string[]>([])
  const [risk, setRisk]               = useState<Risk>('moderate')
  const [amount, setAmount]           = useState('100000')
  const [nStocks, setNStocks]         = useState('10')
  const [sector, setSector]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState<AdvisorRecommendation | null>(null)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    researchApi.getSectors().then(setSectors)
  }, [])

  async function generate() {
    setLoading(true)
    setError(null)
    setResult(null)

    const req: AdvisorRequest = {
      risk_tolerance: risk,
      amount: parseFloat(amount) || 100_000,
      n_stocks: parseInt(nStocks) || 10,
    }
    if (sector) req.sector = sector

    const data = await researchApi.recommend(req)
    if (data) {
      setResult(data)
    } else {
      setError('Unable to generate recommendation. Please try different parameters.')
    }
    setLoading(false)
  }

  const cfg = RISK_CONFIG[risk]

  return (
    <div className="advisor-page">
      <div className="advisor-header">
        <h2 className="advisor-title">Portfolio Advisor</h2>
        <p className="advisor-subtitle">
          Quantitative portfolio construction using Grinold-Kahn factor scoring,
          risk-parity weighting, and AI-generated investment narrative
        </p>
      </div>

      {/* Input form */}
      <div className="advisor-form">
        <div className="risk-selector">
          {(Object.keys(RISK_CONFIG) as Risk[]).map((r) => (
            <button key={r}
              className={`risk-btn ${risk === r ? 'active' : ''}`}
              style={risk === r ? { borderColor: RISK_CONFIG[r].color, color: RISK_CONFIG[r].color } : {}}
              onClick={() => setRisk(r)}>
              <span className="risk-btn-label">{RISK_CONFIG[r].label}</span>
            </button>
          ))}
        </div>

        <div className="risk-desc">{cfg.desc}</div>

        <div className="advisor-inputs">
          <div className="advisor-input-group">
            <label>Investment Amount ($)</label>
            <input type="number" min="1000" value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="advisor-input-group">
            <label>Number of Holdings</label>
            <input type="number" min="5" max="20" value={nStocks}
              onChange={(e) => setNStocks(e.target.value)} />
          </div>

          <div className="advisor-input-group">
            <label>Sector Focus (optional)</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">All Sectors</option>
              {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <button className="generate-btn" onClick={generate} disabled={loading}
            style={{ borderColor: cfg.color, background: loading ? '#b2bec3' : cfg.color }}>
            {loading ? 'Generating…' : 'Generate Portfolio'}
          </button>
        </div>
      </div>

      {error && <div className="advisor-error">{error}</div>}

      {loading && (
        <div className="advisor-loading">
          <div className="loading-spinner" />
          <p>Running quantitative model and generating AI narrative…</p>
        </div>
      )}

      {result && (
        <div className="advisor-result">
          {/* Summary bar */}
          <div className="result-summary">
            <div className="summary-stat">
              <span className="summary-num">{result.picks.length}</span>
              <span className="summary-lbl">Holdings</span>
            </div>
            <div className="summary-stat">
              <span className="summary-num">${parseFloat(amount).toLocaleString()}</span>
              <span className="summary-lbl">Total</span>
            </div>
            <div className="summary-stat">
              <span className="summary-num" style={{ color: cfg.color, textTransform: 'capitalize' }}>
                {result.riskTolerance}
              </span>
              <span className="summary-lbl">Risk Profile</span>
            </div>
            <div className="summary-stat">
              <span className="summary-num">{Object.keys(result.meta.sectorCounts).length}</span>
              <span className="summary-lbl">Sectors</span>
            </div>
          </div>

          <div className="result-grid">
            {/* Allocation donut + legend */}
            <div className="result-card">
              <h3 className="result-card-title">Allocation</h3>
              <AllocationDonut picks={result.picks} />
            </div>

            {/* AI Narrative */}
            <div className="result-card narrative-card">
              <h3 className="result-card-title">AI Investment Brief</h3>
              <div className="narrative-text">
                {result.narrative.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Holdings table */}
          <div className="picks-section">
            <h3 className="picks-title">Recommended Holdings</h3>
            <div className="picks-table-wrap">
              <table className="picks-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Sector</th>
                    <th>Weight</th>
                    <th>Amount</th>
                    <th>Composite Score</th>
                    <th>Value</th>
                    <th>Momentum</th>
                    <th>Quality</th>
                    <th>P/E</th>
                    <th>ROE</th>
                    <th>Beta</th>
                    <th>EPS Grw</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {result.picks.map((p) => (
                    <tr key={p.symbol} className="pick-row">
                      <td className="pick-symbol">{p.symbol}</td>
                      <td className="pick-name">{p.name}</td>
                      <td className="pick-sector">{p.sector}</td>
                      <td className="pick-weight">{(p.weight * 100).toFixed(1)}%</td>
                      <td className="pick-amount">${p.dollarAmount.toLocaleString()}</td>
                      <td><ScoreBar value={p.scores.composite} /></td>
                      <td><ScoreBar value={p.scores.value} /></td>
                      <td><ScoreBar value={p.scores.momentum} /></td>
                      <td><ScoreBar value={p.scores.quality} /></td>
                      <td>{fmt(p.pe)}</td>
                      <td>{p.roe != null ? (p.roe * 100).toFixed(1) + '%' : '—'}</td>
                      <td>{fmt(p.beta)}</td>
                      <td style={{ color: (p.earningsGrowth ?? 0) >= 0 ? '#00b894' : '#d63031' }}>
                        {fmtPct(p.earningsGrowth)}
                      </td>
                      <td>
                        <button className="pick-research-btn"
                          onClick={() => navigate(`/research/${p.symbol}`)}>
                          Research →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology */}
          <div className="methodology-note">
            <strong>Methodology:</strong> Stocks are selected using the Grinold-Kahn IC-weighted factor model
            (value IC=0.04, momentum IC=0.05, quality IC=0.03, analyst IC=0.05).
            Position sizes use inverse-beta risk parity. Maximum 2 stocks per sector for diversification.
            Min score threshold: {result.meta.minScorePct}th percentile · Max beta: {result.meta.maxBeta} ·
            Min market cap: ${(result.meta.minMarketCap / 1e9).toFixed(0)}B.
          </div>
        </div>
      )}
    </div>
  )
}
