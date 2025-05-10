import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface CompanyInfo {
    currency: string
    marketClose: string
    marketOpen: string
    matchScore: string
    name: string
    region: string
    symbol: string
    timezone: string
    type: string
}

const initialState = {
  company: null as CompanyInfo | null,
}

export const marketDataSlice = createSlice({
  name: 'marketData',
  initialState,
  reducers: {
    setCompany: (state, action) => {
      console.log('setCompany action', action)  
      state.company = action.payload
    }
  }
})

export const { setCompany } = marketDataSlice.actions

export default marketDataSlice.reducer