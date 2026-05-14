import { $axios } from "./api";

export interface TimeSeriesEntry {
  "1. open": string;
  "2. high": string;
  "3. low": string;
  "4. close": string;
  "5. adjusted close": string;
  "6. volume": string;
  "7. dividend amount": string;
}

export interface TimeSeriesData {
  [date: string]: TimeSeriesEntry;
}

export default {
  async searchStocks(searchTerm:string) {
    try {
      const response = await $axios.get(`/api/v1/search/${searchTerm}`)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results: ", e)
      return []
    }
  },

  async getTimeSeriesDaily(symbol:string) {
    try {
      const response = await $axios.get(`/api/v1/issuer/${symbol}/timeSeries/daily`)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results", e)
      return []
    }
  },

  async getFredSeries(seriesId: string): Promise<[string, number][]> {
    try {
      const response = await $axios.get(`/api/v1/fred/${seriesId}`)
      return response.data
    } catch(e) {
      console.error(`Error fetching FRED series ${seriesId}`, e)
      return []
    }
  },

  async getEarningsCalendar() {
    try {
      const response = await $axios.get('/api/v1/earnings_cal')
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results", e)
      return []
    }
  }
}