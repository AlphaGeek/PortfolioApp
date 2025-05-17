import { $axiosClaude } from "./api";
import {process } from "node:process"

export default {
  async askClaude(searchTerm:string) {
    try {
      const data = {
        "model": "claude-3-7-sonnet-20250219",
        "max_tokens": 1024,
        "messages": [
            {"role": "user", "content": searchTerm}
        ]
      }
      const response = await $axiosClaude.post(`messages`, data)
      console.log("Claude response: ", response.data)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results: ", e)
      return []
    }
  },
}