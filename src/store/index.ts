import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import marketDataReducer from './slices/marketDataSlice';
import chartsReducer from './slices/chartsSlice';
import portfolioReducer from './slices/portfolioSlice';

export const store = configureStore({
	reducer: {
    	user: userReducer,
			marketData: marketDataReducer,
			charts: chartsReducer,
			portfolio: portfolioReducer,
	}
})

//export type RootState = ReturnType<typeof store.getState>
//export type AppDispatch = typeof store.dispatch