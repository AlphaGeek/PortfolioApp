import { createSlice } from '@reduxjs/toolkit';
import marketDataApi from "../api/marketData"

const initialState = {
  company: null,
  priceData: null,
}

export const marketDataSlice = createSlice({
  name: 'marketData',
  initialState,
  reducers: {
    setCompany: (state, action) => {
       state.company = action.payload
       marketDataApi.getTimeSeriesWeekly(action.payload["1. symbol"]).then((response) => {
          state.priceData = response.data
        })
    },
  }
})

export const { setCompany } = marketDataSlice.actions

export default marketDataSlice.reducer