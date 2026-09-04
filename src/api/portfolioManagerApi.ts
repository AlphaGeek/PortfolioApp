import { $axios } from './api'

export interface AgentPortfolio {
  portfolioId: number
  name: string
  cash: number
  created_at: string
}

export interface AgentHolding {
  symbol: string
  numShares: number
  avgPrice: number | null
  currentPrice: number | null
  marketValue: number | null
  weight: number | null
  sector: string | null
  pmScore: number | null
  beta: number | null
}

export interface AgentPortfolioDetail {
  portfolioId: number
  name: string
  cash: number
  created_at: string
  totalValue: number
  holdings: AgentHolding[]
}

export type DecisionAction = 'BUY' | 'ADD' | 'TRIM' | 'SELL'

export interface AgentDecision {
  runAt: string
  symbol: string
  action: DecisionAction
  numShares: number
  price: number
  dollarAmount: number
  weightBefore: number | null
  weightAfter: number | null
  pmScore: number | null
  rationale: string
}

export interface RebalanceResult {
  decisions: { symbol: string; action: DecisionAction; numShares: number; price: number; dollarAmount: number; rationale: string }[]
  narrative: string
  cash: number
  totalValue: number
  numHoldings: number
}

export interface PerformanceSeries {
  inceptionDate: string | null
  portfolio: [string, number][]
  benchmark: [string, number][]
}

export default {
  async init(startingCash?: number): Promise<AgentPortfolio | null> {
    try {
      const response = await $axios.post('/api/v1/pm/init', startingCash ? { startingCash } : {})
      return response.data
    } catch (e) {
      console.error('Error initializing agent portfolio', e)
      return null
    }
  },

  async run(portfolioId: number, targetN?: number): Promise<RebalanceResult | null> {
    try {
      const response = await $axios.post(`/api/v1/pm/${portfolioId}/run`, targetN ? { targetN } : {})
      return response.data
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Rebalance failed'
      throw new Error(msg)
    }
  },

  async snapshot(portfolioId: number): Promise<void> {
    try { await $axios.post(`/api/v1/pm/${portfolioId}/snapshot`) } catch (e) { console.error('Error snapshotting NAV', e) }
  },

  async getHoldings(portfolioId: number): Promise<AgentPortfolioDetail | null> {
    try {
      const response = await $axios.get(`/api/v1/pm/${portfolioId}/holdings`)
      return response.data
    } catch (e) {
      console.error('Error fetching agent holdings', e)
      return null
    }
  },

  async getDecisions(portfolioId: number, limit = 100): Promise<AgentDecision[]> {
    try {
      const response = await $axios.get(`/api/v1/pm/${portfolioId}/decisions`, { params: { limit } })
      return response.data
    } catch (e) {
      console.error('Error fetching agent decisions', e)
      return []
    }
  },

  async getPerformance(portfolioId: number): Promise<PerformanceSeries | null> {
    try {
      const response = await $axios.get(`/api/v1/pm/${portfolioId}/performance`)
      return response.data
    } catch (e) {
      console.error('Error fetching agent performance', e)
      return null
    }
  },
}
