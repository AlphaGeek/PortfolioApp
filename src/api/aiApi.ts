import { $axios } from "./api";

export default {
  async askOpenAI(prompt:string) {
    try {
      const data = {prompt}
      const response = await $axios.post('/api/v1/ai/askOpenAI', data)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the Open AI results: ", e)
      return []
    }
  },
  
  async askClaude(prompt:string) {
    try {
      const data = {prompt}
      const config = {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "anthropic-dangerous-direct-browser-access": "true"
        }
      }
      const response = await $axios.post('/api/v1/ai/askClaude', data, config)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the Claude results: ", e)
      return []
    }
  }
}