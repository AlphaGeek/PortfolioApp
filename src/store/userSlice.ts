import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  userInfo: null,
  jwtToken: ""
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
       state.userInfo = action.payload
    },
    setJwtToken: (state, action) => {
      state.jwtToken = action.payload
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