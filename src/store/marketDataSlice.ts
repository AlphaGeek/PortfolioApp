import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  company: null
}

export const marketDataSlice = createSlice({
  name: 'marketData',
  initialState,
  reducers: {
    setCompany: (state, action) => {
      state.company = action.payload
    },
  }
})

export const { setCompany } = marketDataSlice.actions

export default marketDataSlice.reducer