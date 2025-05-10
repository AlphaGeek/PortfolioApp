import { createSlice } from '@reduxjs/toolkit'
import UserApi from '@/api/user'
import * as localforage from 'localforage'

export interface UserInfo {
  "iss": string
  "azp": string
  "aud": string
  "sub": string
  "email": string
  "email_verified": boolean
  "nbf": number
  "name": string
  "picture": string
  "given_name": string
  "family_name": string
  "iat": number
  "exp": number
  "jti": string
}

const initialState = {
  isAuthenticated: false,
  userInfo: null as UserInfo | null,
  jwtToken: ""
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
       state.userInfo = action.payload
       if (state.userInfo) {
          UserApi.addUpdateUser(state.userInfo)
       }
    },

    setJwtToken: (state, action) => {
      state.jwtToken = action.payload
      localforage.setItem("portfolio-token", state.jwtToken)
    },
    
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload
      if (state.isAuthenticated && window.document.getElementById("signInDiv")) {
        let el = window?.document?.getElementById("signInDiv") 
        if(el) {
          el.style.visibility = "hidden"
        }
      }
    }
  }
})

export const { setUserInfo, setJwtToken, setIsAuthenticated } = userSlice.actions

export default userSlice.reducer