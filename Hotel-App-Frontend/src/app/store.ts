import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/authSlice"
import favouritesReducer from "../features/favouriteSlice"

// Create the Redux store and add the authentication reducer
export const store = configureStore({
    reducer: {
        auth: authReducer,
        favourites:favouritesReducer
    }
})

// Types for accessing the Redux state and dispatching actions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch