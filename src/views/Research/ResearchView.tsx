import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import researchApi, {
  ResearchProfile, Financials
} from '@/api/researchApi'
import './ResearchView.css'

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v == null) return '—'
  return v.toLocaleString(undefined, { maximumFractionDigits: decimals })
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return '—'
  return (v * 100).toFixed(1) + '%'
}

function fmtB(v: number | null | undefined): string {
  if (v == null) return '—'
  if (Math.abs(v) >= 1e12) return '$' + (v / 1e12).toFixed(2) + 'T'
  if (Math.abs(v) >= 1e9)  return '$' + (v / 1e9).toFixed(2)  + 'B'
  if (Math.abs(v) >= 1e6)  return '$' + (v / 1e6).toFixed(2)  + 'M'
  return '$' + v.toLocaleString()
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: '#00b894', B: '#0984e3', C: '#fdcb6e', D: '#e17055', F: '#d63031'
  }
  return map[grade] ?? '#636e72'
}

function sentimentColor(label: string): string {
  if (label.toLowerCase().includes('bull')) return '#00b894'
  if (label.toLowerCase().includes('bear')) return '#d63031'
  return '#636e72'
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? '#00b894' : value >= 40 ? '#0984e3' : '#e17055'
  return (
    <div className="score-bar-row">
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="score-bar-value">{value.toFixed(0)}</span>
    </div>
  )
}

// ─── AnalystDonut ──────────────────────────────────────────────────────────────

function AnalystDonut({ ratings }: { ratings: ResearchProfile['analystRatings'] }) {
  const { strongBuy = 0, buy = 0, hold = 0, sell = 0, strongSell = 0 } = ratings
  const total = (strongBuy ?? 0) + (buy ?? 0) + (hold ?? 0) + (sell ?? 0) + (strongSell ?? 0)
  if (total === 0) return <p className="no-data">No analyst ratings</p>

  const pct = (v: number | null) => (((v ?? 0) / total) * 100).toFixed(0)
  const bars = [
    { label: 'Strong Buy', count: strongBuy ?? 0, color: '#00b894' },
    { label: 'Buy',        count: buy ?? 0,        color: '#55efc4' },
    { label: 'Hold',       count: hold ?? 0,       color: '#fdcb6e' },
    { label: 'Sell',       count: sell ?? 0,       color: '#e17055' },
    { label: 'Strong Sell',count: strongSell ?? 0, color: '#d63031' },
  ]
  return (
    <div className="analyst-bars">
      {bars.map((b) => (
        <div key={b.label} className="analyst-bar-row">
          <span className="analyst-bar-label">{b.label}</span>
          <div className="analyst-bar-track">
            <div
              className="analyst-bar-fill"
              style={{ width: `${pct(b.count)}%`, background: b.color }}
            />
          </div>
          <span className="analyst-bar-count">{b.count}</span>
        </div>
      ))}
      <p className="analyst-consensus">{ratings.consensus} · {total} analysts</p>
    </div>
  )
}

// ─── EarningsChart ─────────────────────────────────────────────────────────────

function EarningsChart({ history }: { history: ResearchProfile['earningsHistory'] }) {
  if (!history.length) return <p className="no-data">No earnings history</p>
  const values = history.map((h) => h.reportedEPS ?? 0)
  const max = Math.max(...values.map(Math.abs), 0.01)

  return (
    <div className="earnings-chart">
      {history.slice(-8).map((h) => {
        const val = h.reportedEPS ?? 0
        const height = Math.abs(val) / max * 80
        const color = val >= 0 ? '#0984e3' : '#d63031'
        return (
          <div key={h.date} className="earnings-bar-col">
            <span className="earnings-bar-tip">{val >= 0 ? '+' : ''}{fmt(val)}</span>
            <div
              className="earnings-bar"
              style={{ height: `${height}px`, background: color }}
            />
            <span className="earnings-bar-date">{h.date.slice(0, 7)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── EstimateRevisions ─────────────────────────────────────────────────────────

function EstimateRevisions({ estimates }: { estimates: ResearchProfile['earningsEstimates'] }) {
  if (!estimates.length) return <p className="no-data">No estimates available</p>
  return (
    <table className="estimates-table">
      <thead>
        <tr>
          <th>Period</th>
          <th>Consensus EPS</th>
          <th>30-Day Change</th>
          <th>Range</th>
          <th>Analysts</th>
        </tr>
      </thead>
      <tbody>
        {estimates.map((e) => (
          <tr key={e.date}>
            <td>{e.horizon || e.date}</td>
            <td>${fmt(e.epsAvg)}</td>
            <td style={{ color: (e.revision ?? 0) >= 0 ? '#00b894' : '#d63031' }}>
              {e.revision != null ? ((e.revision >= 0 ? '+' : '') + e.revision.toFixed(1) + '%') : '—'}
            </td>
            <td>${fmt(e.epsLow)} – ${fmt(e.epsHigh)}</td>
            <td>{e.analystCount ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── InsiderTable ──────────────────────────────────────────────────────────────

function InsiderTable({ transactions }: { transactions: ResearchProfile['insiderTransactions'] }) {
  if (!transactions.length) return <p className="no-data">No recent insider activity</p>
  return (
    <table className="insider-table">
      <thead>
        <tr><th>Date</th><th>Executive</th><th>Type</th><th>Shares</th><th>Price</th></tr>
      </thead>
      <tbody>
        {transactions.map((t, i) => (
          <tr key={i}>
            <td>{t.date}</td>
            <td>{t.executive || '—'}</td>
            <td style={{ color: t.type === 'Buy' ? '#00b894' : '#d63031', fontWeight: 600 }}>
              {t.type}
            </td>
            <td>{t.shares != null ? t.shares.toLocaleString() : '—'}</td>
            <td>{t.price != null ? '$' + fmt(t.price) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── FinancialsTab ─────────────────────────────────────────────────────────────

function FinancialsTab({ symbol }: { symbol: string }) {
  const [financials, setFinancials] = useState<Financials | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'income' | 'balance' | 'cashflow'>('income')

  useEffect(() => {
    setLoading(true)
    researchApi.getFinancials(symbol).then((f) => {
      setFinancials(f)
      setLoading(false)
    })
  }, [symbol])

  if (loading) return <p className="loading">Loading financials…</p>
  if (!financials) return <p className="no-data">No financials available</p>

  const KEY_INCOME = ['fiscalDateEnding', 'totalRevenue', 'grossProfit', 'operatingIncome',
    'ebitda', 'netIncome', 'eps']
  const KEY_BALANCE = ['fiscalDateEnding', 'totalAssets', 'totalCurrentAssets',
    'totalLiabilities', 'totalShareholderEquity', 'cashAndCashEquivalentsAtCarryingValue',
    'longTermDebt', 'commonStockSharesOutstanding']
  const KEY_CF = ['fiscalDateEnding', 'operatingCashflow', 'capitalExpenditures',
    'cashflowFromInvestment', 'cashflowFromFinancing', 'netIncome', 'dividendPayout']

  const tableMap = {
    income:   { data: financials.incomeStatement  ?? [], keys: KEY_INCOME },
    balance:  { data: financials.balanceSheet     ?? [], keys: KEY_BALANCE },
    cashflow: { data: financials.cashFlow         ?? [], keys: KEY_CF },
  }
  const { data, keys } = tableMap[tab]
  const rows = data

  return (
    <div className="financials-section">
      {rows.length === 0 && <p className="no-data">No {tab} data available for {symbol}</p>}
      <div className="fin-tabs">
        {(['income', 'balance', 'cashflow'] as const).map((t) => (
          <button key={t} className={`fin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}>
            {t === 'income' ? 'Income Statement' : t === 'balance' ? 'Balance Sheet' : 'Cash Flow'}
          </button>
        ))}
      </div>
      <div className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Metric</th>
              {rows.map((r) => <th key={r.fiscalDateEnding}>{String(r.fiscalDateEnding).slice(0, 10)}</th>)}
            </tr>
          </thead>
          <tbody>
            {keys.filter((k) => k !== 'fiscalDateEnding').map((key) => (
              <tr key={key}>
                <td className="fin-metric">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                {rows.map((r) => {
                  const val = r[key]
                  return (
                    <td key={r.fiscalDateEnding}>
                      {val == null ? '—'
                        : typeof val === 'number' && Math.abs(val) > 1e5
                          ? fmtB(val)
                          : fmt(val)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function ResearchView() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ResearchProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'earnings' | 'insiders'>('overview')

  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    researchApi.getProfile(symbol.toUpperCase()).then((p) => {
      setProfile(p)
      setLoading(false)
    })
  }, [symbol])

  if (loading) {
    return (
      <div className="research-page">
        <div className="research-loading">Loading research for {symbol}…</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="research-page">
        <div className="research-error">No data found for <strong>{symbol}</strong></div>
      </div>
    )
  }

  const f = profile.fundamentals
  const q = profile.quantScore
  const tabs = ['overview', 'financials', 'earnings', 'insiders'] as const

  return (
    <div className="research-page">
      {/* Header */}
      <div className="research-header">
        <div className="research-title-block">
          <div className="research-symbol">{profile.symbol}</div>
          <div className="research-name">{profile.name}</div>
          <div className="research-meta">
            {profile.sector} · {profile.industry} · {profile.exchange}
          </div>
        </div>
        <div className="quant-grade-badge" style={{ background: gradeColor(q.grade) }}>
          {q.grade}
          <span className="quant-grade-label">Quant Score</span>
        </div>
        <button className="chart-link-btn"
          onClick={() => navigate(`/market-data/${profile.symbol}`)}>
          View Chart →
        </button>
      </div>

      {/* Tab bar */}
      <div className="research-tabs">
        {tabs.map((t) => (
          <button key={t} className={`research-tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Overview tab ──────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="research-grid">
          {/* Key Metrics */}
          <div className="research-card">
            <h3 className="card-title">Key Metrics</h3>
            <div className="metrics-grid">
              <MetricPair label="P/E (TTM)"    value={fmt(f.pe)} />
              <MetricPair label="Forward P/E"  value={fmt(f.forwardPE)} />
              <MetricPair label="PEG"           value={fmt(f.peg)} />
              <MetricPair label="P/B"           value={fmt(f.pb)} />
              <MetricPair label="P/S"           value={fmt(f.ps)} />
              <MetricPair label="EV/EBITDA"     value={fmt(f.evToEBITDA)} />
              <MetricPair label="EPS (TTM)"     value={f.eps != null ? '$' + fmt(f.eps) : '—'} />
              <MetricPair label="Market Cap"    value={fmtB(f.marketCap)} />
              <MetricPair label="Revenue TTM"   value={fmtB(f.revenueTTM)} />
              <MetricPair label="EBITDA"        value={fmtB(f.ebitda)} />
              <MetricPair label="Profit Margin" value={fmtPct(f.profitMargin)} />
              <MetricPair label="Op. Margin"    value={fmtPct(f.operatingMargin)} />
              <MetricPair label="ROE"           value={fmtPct(f.roe)} />
              <MetricPair label="ROA"           value={fmtPct(f.roa)} />
              <MetricPair label="Beta"          value={fmt(f.beta)} />
              <MetricPair label="Div. Yield"    value={fmtPct(f.dividendYield)} />
              <MetricPair label="52-Wk High"    value={f.week52High != null ? '$' + fmt(f.week52High) : '—'} />
              <MetricPair label="52-Wk Low"     value={f.week52Low != null ? '$' + fmt(f.week52Low) : '—'} />
              <MetricPair label="50-Day MA"     value={f.ma50 != null ? '$' + fmt(f.ma50) : '—'} />
              <MetricPair label="200-Day MA"    value={f.ma200 != null ? '$' + fmt(f.ma200) : '—'} />
              <MetricPair label="Target Price"  value={f.analystTargetPrice != null ? '$' + fmt(f.analystTargetPrice) : '—'} />
              <MetricPair label="Earnings Growth" value={f.earningsGrowthYOY != null ? fmtPct(f.earningsGrowthYOY) : '—'} />
            </div>
          </div>

          {/* Quant Score */}
          <div className="research-card">
            <h3 className="card-title">Quant Factor Scores <span className="card-subtitle">(percentile vs universe)</span></h3>
            <div className="composite-score">
              <div className="composite-number" style={{ color: gradeColor(q.grade) }}>
                {q.composite.toFixed(0)}
              </div>
              <div className="composite-label">Composite · Grade {q.grade}</div>
            </div>
            <ScoreBar label="Value"    value={q.value} />
            <ScoreBar label="Momentum" value={q.momentum} />
            <ScoreBar label="Quality"  value={q.quality} />
            <ScoreBar label="Analyst"  value={q.analyst} />
            <p className="score-footnote">
              Based on Grinold-Kahn IC-weighted factor model. Percentile rank across active universe.
            </p>
          </div>

          {/* Analyst Ratings */}
          <div className="research-card">
            <h3 className="card-title">Analyst Ratings</h3>
            <AnalystDonut ratings={profile.analystRatings} />
            {f.analystTargetPrice && (
              <p className="target-price">
                Consensus target: <strong>${fmt(f.analystTargetPrice)}</strong>
              </p>
            )}
          </div>

          {/* Sentiment */}
          <div className="research-card">
            <h3 className="card-title">News Sentiment</h3>
            <div className="sentiment-display">
              <div className="sentiment-score" style={{ color: sentimentColor(profile.sentiment.label) }}>
                {profile.sentiment.score >= 0 ? '+' : ''}{profile.sentiment.score.toFixed(3)}
              </div>
              <div className="sentiment-label" style={{ color: sentimentColor(profile.sentiment.label) }}>
                {profile.sentiment.label}
              </div>
              <div className="sentiment-articles">{profile.sentiment.articles} recent articles analysed</div>
            </div>
          </div>

          {/* Insider Ownership */}
          <div className="research-card">
            <h3 className="card-title">Ownership</h3>
            <div className="metrics-grid">
              <MetricPair label="Insider %" value={fmtPct((f.percentInsiders ?? 0) / 100)} />
              <MetricPair label="Institution %" value={fmtPct((f.percentInstitutions ?? 0) / 100)} />
              <MetricPair label="Float" value={fmtB(f.sharesFloat)} />
              <MetricPair label="Shares Out." value={fmtB(f.sharesOutstanding)} />
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <div className="research-card research-card-full">
              <h3 className="card-title">About {profile.name}</h3>
              <p className="description-text">{profile.description}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Financials tab ─────────────────────────────────────────── */}
      {activeTab === 'financials' && symbol && <FinancialsTab symbol={symbol.toUpperCase()} />}

      {/* ── Earnings tab ──────────────────────────────────────────── */}
      {activeTab === 'earnings' && (
        <div className="research-grid">
          <div className="research-card research-card-full">
            <h3 className="card-title">Historical EPS</h3>
            <EarningsChart history={profile.earningsHistory} />
          </div>
          <div className="research-card research-card-full">
            <h3 className="card-title">Forward Estimates & Revisions</h3>
            <EstimateRevisions estimates={profile.earningsEstimates} />
          </div>
        </div>
      )}

      {/* ── Insiders tab ──────────────────────────────────────────── */}
      {activeTab === 'insiders' && (
        <div className="research-grid">
          <div className="research-card research-card-full">
            <h3 className="card-title">Recent Insider Transactions</h3>
            <InsiderTable transactions={profile.insiderTransactions} />
          </div>
        </div>
      )}
    </div>
  )
}

function MetricPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-pair">
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
    </div>
  )
}
