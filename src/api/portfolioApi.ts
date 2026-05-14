import { $axios } from './api'

export interface Portfolio {
  portfolioId: number
  name: string
  created_at: string
}

export interface Holding {
  symbol: string
  numShares: number
}

export interface TradeRequest {
  symbol: string
  side: 'BUY' | 'SELL'
  numShares: number
  price: number
}

export default {
  async getHoldings(portfolioId: number): Promise<Holding[]> {
    try {
      const response = await $axios.get(`/api/v1/portfolio/${portfolioId}/holdings`)
      return response.data
    } catch (e) {
      console.error('Error fetching holdings', e)
      return []
    }
  },

  async placeTrade(portfolioId: number, trade: TradeRequest): Promise<{ message: string } | null> {
    try {
      const response = await $axios.post(`/api/v1/portfolio/${portfolioId}/trade`, trade)
      return response.data
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Trade failed'
      throw new Error(msg)
    }
  },

  async getPortfolio(): Promise<Portfolio[]> {
    try {
      const response = await $axios.get('/api/v1/portfolio')
      return response.data
    } catch (e) {
      console.error('Error fetching portfolio', e)
      return []
    }
  },

  async createPortfolio(name = 'My Portfolio'): Promise<Portfolio | null> {
    try {
      const response = await $axios.post('/api/v1/portfolio', { name })
      return response.data
    } catch (e) {
      console.error('Error creating portfolio', e)
      return null
    }
  }
}
