import { createSlice } from '@reduxjs/toolkit'
import UserApi from '@/api/user'
import localforage from 'localforage'

export interface UserInfo {
  "iss": "https://accounts.google.com",
  "azp": "1019566960350-cjkjn2nrf3hri2a3qfdgienuansjbkts.apps.googleusercontent.com",
  "aud": "1019566960350-cjkjn2nrf3hri2a3qfdgienuansjbkts.apps.googleusercontent.com",
  "sub": "101745648006272280583",
  "email": "michael.e.lacy@gmail.com",
  "email_verified": true,
  "nbf": 1746399308,
  "name": "Michael Lacy",
  "picture": "https://lh3.googleusercontent.com/a/ACg8ocJcY-Nz0CJphQ72lmlQeVL1dBrpC-NWyl448z3O75NaKe6oxw=s96-c",
  "given_name": "Michael",
  "family_name": "Lacy",
  "iat": 1746399608,
  "exp": 1746403208,
  "jti": "ea1e72800eae47faf68f09305e787b53ff2adc33"
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