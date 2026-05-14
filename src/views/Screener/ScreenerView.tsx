import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import researchApi, { ScreenerResult, ScreenerParams } from '@/api/researchApi'
import './ScreenerView.css'

type SortKey = 'composite' | 'value' | 'momentum' | 'quality' | 'analyst'
  | 'pe' | 'roe' | 'earningsGrowth' | 'marketCap'

const SCORE_COLS: { key: SortKey; label: string }[] = [
  { key: 'composite', label: 'Score' },
  { key: 'value',     label: 'Value' },
  { key: 'momentum',  label: 'Momentum' },
  { key: 'quality',   label: 'Quality' },
  { key: 'analyst',   label: 'Analyst' },
]

function ScoreChip({ value }: { value: number }) {
  const color = value >= 70 ? '#00b894' : value >= 40 ? '#0984e3' : '#e17055'
  return (
    <span className="score-chip" style={{ background: color + '20', color }}>
      {value.toFixed(0)}
    </span>
  )
}

function fmt(v: number | null | undefined, d = 1): string {
  if (v == null) return '—'
  return v.toLocaleString(undefined, { maximumFractionDigits: d })
}

function fmtB(v: number | null | undefined): string {
  if (v == null) return '—'
  if (v >= 1e12) return (v / 1e12).toFixed(1) + 'T'
  if (v >= 1e9)  return (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6)  return (v / 1e6).toFixed(1) + 'M'
  return v.toLocaleString()
}

export default function ScreenerView() {
  const navigate = useNavigate()
  const [results, setResults]   = useState<ScreenerResult[]>([])
  const [sectors, setSectors]   = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [sortKey, setSortKey]   = useState<SortKey>('composite')
  const [sortAsc, setSortAsc]   = useState(false)

  // Filter state
  const [sector,   setSector]   = useState('')
  const [minCap,   setMinCap]   = useState('')
  const [maxPE,    setMaxPE]    = useState('')
  const [minScore, setMinScore] = useState('50')
  const [limit,    setLimit]    = useState('100')

  useEffect(() => {
    researchApi.getSectors().then(setSectors)
    runScreen()
  }, [])

  function runScreen() {
    setLoading(true)
    const params: ScreenerParams = {
      limit: parseInt(limit) || 100,
      min_score: parseFloat(minScore) || undefined,
    }
    if (sector)  params.sector = sector
    if (minCap)  params.min_cap = parseFloat(minCap) * 1e9
    if (maxPE)   params.max_pe = parseFloat(maxPE)
    if (SCORE_COLS.some((c) => c.key === sortKey)) {
      params.sort_by = sortKey as any
    }

    researchApi.screen(params).then((data) => {
      setResults(data)
      setLoading(false)
    })
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((a) => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = useMemo(() => {
    const dir = sortAsc ? 1 : -1
    return [...results].sort((a, b) => {
      let av: number | null = null
      let bv: number | null = null
      if (['composite','value','momentum','quality','analyst'].includes(sortKey)) {
        av = a.scores[sortKey as keyof typeof a.scores] ?? null
        bv = b.scores[sortKey as keyof typeof b.scores] ?? null
      } else {
        av = (a as any)[sortKey] ?? null
        bv = (b as any)[sortKey] ?? null
      }
      if (av === null && bv === null) return 0
      if (av === null) return 1
      if (bv === null) return -1
      return (av - bv) * dir
    })
  }, [results, sortKey, sortAsc])

  function SortTh({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col
    return (
      <th className={`sortable ${active ? 'sort-active' : ''}`}
        onClick={() => handleSort(col)}>
        {label}
        <span className="sort-icon">{active ? (sortAsc ? '↑' : '↓') : '↕'}</span>
      </th>
    )
  }

  return (
    <div className="screener-page">
      <div className="screener-header">
        <h2 className="screener-title">Stock Screener</h2>
        <p className="screener-subtitle">
          Quantitative ranking using Grinold-Kahn factor model · {results.length} results
        </p>
      </div>

      {/* Filters */}
      <div className="screener-filters">
        <div className="filter-group">
          <label>Sector</label>
          <select value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">All Sectors</option>
            {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label>Min Score (0–100)</label>
          <input type="number" min="0" max="100" value={minScore}
            onChange={(e) => setMinScore(e.target.value)} />
        </div>

        <div className="filter-group">
          <label>Min Market Cap ($B)</label>
          <input type="number" min="0" placeholder="e.g. 1" value={minCap}
            onChange={(e) => setMinCap(e.target.value)} />
        </div>

        <div className="filter-group">
          <label>Max P/E Ratio</label>
          <input type="number" min="0" placeholder="e.g. 30" value={maxPE}
            onChange={(e) => setMaxPE(e.target.value)} />
        </div>

        <div className="filter-group">
          <label>Results</label>
          <select value={limit} onChange={(e) => setLimit(e.target.value)}>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>

        <button className="screen-btn" onClick={runScreen} disabled={loading}>
          {loading ? 'Screening…' : 'Run Screen'}
        </button>
      </div>

      {/* Results table */}
      {loading ? (
        <div className="screener-loading">Running quantitative screen…</div>
      ) : (
        <div className="screener-table-wrap">
          <table className="screener-table">
            <thead>
              <tr>
                <th>#</th>
                <SortTh col="composite"    label="Comp." />
                <SortTh col="value"        label="Value" />
                <SortTh col="momentum"     label="Mom." />
                <SortTh col="quality"      label="Qual." />
                <SortTh col="analyst"      label="Analyst" />
                <th>Symbol</th>
                <th>Name</th>
                <th>Sector</th>
                <SortTh col="marketCap"     label="Mkt Cap" />
                <SortTh col="pe"            label="P/E" />
                <SortTh col="roe"           label="ROE" />
                <SortTh col="earningsGrowth" label="EPS Grw" />
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => (
                <tr key={r.symbol} className="screener-row"
                  onClick={() => navigate(`/research/${r.symbol}`)}>
                  <td className="row-num">{i + 1}</td>
                  <td><ScoreChip value={r.scores.composite} /></td>
                  <td><ScoreChip value={r.scores.value} /></td>
                  <td><ScoreChip value={r.scores.momentum} /></td>
                  <td><ScoreChip value={r.scores.quality} /></td>
                  <td><ScoreChip value={r.scores.analyst} /></td>
                  <td className="symbol-cell">{r.symbol}</td>
                  <td className="name-cell">{r.name}</td>
                  <td className="sector-cell">{r.sector}</td>
                  <td>{fmtB(r.marketCap)}</td>
                  <td>{fmt(r.pe)}</td>
                  <td>{r.roe != null ? (r.roe * 100).toFixed(1) + '%' : '—'}</td>
                  <td style={{ color: (r.earningsGrowth ?? 0) >= 0 ? '#00b894' : '#d63031' }}>
                    {r.earningsGrowth != null
                      ? ((r.earningsGrowth >= 0 ? '+' : '') + (r.earningsGrowth * 100).toFixed(1) + '%')
                      : '—'}
                  </td>
                  <td>{r.analystTarget != null ? '$' + fmt(r.analystTarget, 2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {sorted.length === 0 && !loading && (
            <div className="no-results">No stocks match the current filters. Try adjusting your criteria.</div>
          )}
        </div>
      )}

      {/* Factor legend */}
      <div className="screener-legend">
        <h4>Factor Definitions</h4>
        <div className="legend-grid">
          <div><strong>Value</strong> — P/E, P/B, EV/EBITDA cross-sectional rank (lower multiples = higher score)</div>
          <div><strong>Momentum</strong> — Earnings & revenue growth YoY + price vs 200-DMA</div>
          <div><strong>Quality</strong> — ROE, profit margin, operating margin</div>
          <div><strong>Analyst</strong> — Weighted analyst consensus (Strong Buy = 2×, Buy = 1×)</div>
          <div><strong>Composite</strong> — IC-weighted combination using Grinold-Kahn factor model</div>
        </div>
      </div>
    </div>
  )
}
