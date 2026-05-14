import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import portfolioApi, { Portfolio } from '@/api/portfolioApi'

interface PortfolioState {
  portfolio: Portfolio | null
  loaded: boolean
}

const initialState: PortfolioState = {
  portfolio: null,
  loaded: false,
}

export const fetchPortfolio = createAsyncThunk('portfolio/fetch', async () => {
  const results = await portfolioApi.getPortfolio()
  return results[0] ?? null
})

export const createPortfolio = createAsyncThunk('portfolio/create', async () => {
  return await portfolioApi.createPortfolio()
})

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.portfolio = action.payload
        state.loaded = true
      })
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.portfolio = action.payload
        state.loaded = true
      })
  },
})

export default portfolioSlice.reducer
