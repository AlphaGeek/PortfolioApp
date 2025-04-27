import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import marketDataReducer from './marketDataSlice';

export const store = configureStore({
	reducer: {
    	user: userReducer,
			marketData: marketDataReducer,
	}
})

//export type RootState = ReturnType<typeof store.getState>
//export type AppDispatch = typeof store.dispatch