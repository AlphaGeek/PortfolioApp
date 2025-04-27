import { $axios } from "./api";

export default {
  async searchStocks(searchTerm:string) {
    try {
      const response = await $axios.get(`/api/v1/search/${searchTerm}`)
      response.data.bestMatches = response.data.bestMatches.filter((match: any) => match["3. type"] === "Equity")
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results", e)
      return []
    }
  },

  async getTimeSeriesWeekly(symbol:string) {
    try {
      const response = await $axios.get(`/api/v1/issuer/${symbol}/timeSeries/weekly`)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results", e)
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