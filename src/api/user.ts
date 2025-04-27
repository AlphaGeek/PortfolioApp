import { $axios } from "./api";

export default {
  async addUpdateUser(user) {
    try {
      
      const response = await $axios.post(`/api/v1/user/add_update`, user)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results", e)
      return null
    }   
  }
}