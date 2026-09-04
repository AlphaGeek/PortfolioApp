import { $axios } from './api'

export interface QuantScore {
  composite: number
  value: number
  momentum: number
  quality: number
  analyst: number
  grade: string
}

export interface AnalystRatings {
  strongBuy: number | null
  buy: number | null
  hold: number | null
  sell: number | null
  strongSell: number | null
  consensus: string
}

export interface Fundamentals {
  marketCap: number | null
  pe: number | null
  trailingPE: number | null
  forwardPE: number | null
  peg: number | null
  pb: number | null
  ps: number | null
  evToRevenue: number | null
  evToEBITDA: number | null
  eps: number | null
  dilutedEPS: number | null
  bookValue: number | null
  dividendYield: number | null
  dividendPerShare: number | null
  beta: number | null
  profitMargin: number | null
  operatingMargin: number | null
  roa: number | null
  roe: number | null
  revenueTTM: number | null
  grossProfitTTM: number | null
  ebitda: number | null
  revenuePerShare: number | null
  earningsGrowthYOY: number | null
  revenueGrowthYOY: number | null
  analystTargetPrice: number | null
  week52High: number | null
  week52Low: number | null
  ma50: number | null
  ma200: number | null
  sharesOutstanding: number | null
  sharesFloat: number | null
  percentInsiders: number | null
  percentInstitutions: number | null
}

export interface EarningsHistoryPoint {
  date: string
  reportedEPS: number | null
}

export interface EarningsEstimate {
  date: string
  horizon: string
  epsAvg: number | null
  epsHigh: number | null
  epsLow: number | null
  eps30DaysAgo: number | null
  revenueAvg: number | null
  analystCount: number | null
  revision: number
}

export interface Sentiment {
  score: number
  label: string
  articles: number
}

export interface InsiderTransaction {
  date: string
  executive: string | null
  title: string | null
  type: 'Buy' | 'Sell'
  shares: number | null
  price: number | null
}

export interface ResearchProfile {
  symbol: string
  name: string
  sector: string
  industry: string
  description: string | null
  exchange: string
  country: string
  currency: string
  ipoDate: string | null
  officialSite: string
  fundamentals: Fundamentals
  analystRatings: AnalystRatings
  quantScore: QuantScore
  sentiment: Sentiment
  earningsHistory: EarningsHistoryPoint[]
  earningsEstimates: EarningsEstimate[]
  insiderTransactions: InsiderTransaction[]
}

export interface ScreenerResult {
  symbol: string
  name: string
  sector: string
  industry: string
  marketCap: number | null
  pe: number | null
  forwardPE: number | null
  pb: number | null
  beta: number | null
  dividendYield: number | null
  profitMargin: number | null
  roe: number | null
  earningsGrowth: number | null
  revenueGrowth: number | null
  analystTarget: number | null
  totalRatings: number
  scores: {
    composite: number
    value: number
    momentum: number
    quality: number
    analyst: number
  }
}

export interface ScreenerParams {
  sector?: string
  min_cap?: number
  max_pe?: number
  min_score?: number
  limit?: number
  sort_by?: 'composite' | 'value' | 'momentum' | 'quality' | 'analyst'
}

export interface PickScore {
  composite: number
  value: number
  momentum: number
  quality: number
  analyst: number
}

export interface PortfolioPick {
  symbol: string
  name: string
  sector: string
  industry: string
  weight: number
  dollarAmount: number
  currentPrice: number | null
  pe: number | null
  roe: number | null
  beta: number | null
  earningsGrowth: number | null
  dividendYield: number | null
  analystTarget: number | null
  scores: PickScore
}

export interface AdvisorRecommendation {
  riskTolerance: string
  amount: number
  picks: PortfolioPick[]
  narrative: string
  meta: {
    minScorePct: number
    maxBeta: number
    minMarketCap: number
    sectorCounts: Record<string, number>
  }
}

export interface AdvisorRequest {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  amount: number
  n_stocks: number
  sector?: string
}

export interface Financials {
  incomeStatement: Record<string, any>[]
  balanceSheet: Record<string, any>[]
  cashFlow: Record<string, any>[]
}

const researchApi = {
  async getProfile(symbol: string): Promise<ResearchProfile | null> {
    try {
      const res = await $axios.get(`/api/v1/research/${symbol}`)
      return res.data
    } catch (e) {
      console.error('Error fetching research profile', e)
      return null
    }
  },

  async getFinancials(symbol: string): Promise<Financials | null> {
    try {
      const res = await $axios.get(`/api/v1/research/${symbol}/financials`)
      return res.data
    } catch (e) {
      console.error('Error fetching financials', e)
      return null
    }
  },

  async screen(params: ScreenerParams = {}): Promise<ScreenerResult[]> {
    try {
      const res = await $axios.get('/api/v1/screener', { params })
      return res.data
    } catch (e) {
      console.error('Error screening stocks', e)
      return []
    }
  },

  async getSectors(): Promise<string[]> {
    try {
      const res = await $axios.get('/api/v1/screener/sectors')
      return res.data
    } catch (e) {
      return []
    }
  },

  async recommend(req: AdvisorRequest): Promise<AdvisorRecommendation | null> {
    try {
      const res = await $axios.post('/api/v1/advisor/recommend', req)
      return res.data
    } catch (e) {
      console.error('Error fetching recommendation', e)
      return null
    }
  },
}

export default researchApi
