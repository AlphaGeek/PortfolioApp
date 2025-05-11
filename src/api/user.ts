import { $axios } from "./api";
import { UserInfo } from "@/store/slices/userSlice"

export default {
  async addUpdateUser(user:UserInfo) {
    try {
      const response = await $axios.post(`/api/v1/add_update`, user)
      return response.data
    } catch(e) {
      console.error("An error occurred while fetching the search results", e)
      return null
    }   
  }
}