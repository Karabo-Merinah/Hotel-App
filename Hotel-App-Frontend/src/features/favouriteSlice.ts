import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { FavouriteHotel } from "../types/hotel"

// Initial state for favourite hotels
const initialState: FavouriteHotel[] = []

const favouritesSlice = createSlice({
    name: "favourites",
    initialState,
    reducers: {
        // Store favourite hotels returned by the backend
        setFavourites: (_, action: PayloadAction<FavouriteHotel[]>) => {
            return action.payload
        },
        // Add a hotel to favourites
        addFavourite: (state, action: PayloadAction<FavouriteHotel>) => {
            if (!state.some(hotel => hotel.id === action.payload.id)) {
                state.push(action.payload)
            }
        },
        // Remove a hotel from favourites
        removeFavourite: (state, action: PayloadAction<number>) => {
            return state.filter(hotel => hotel.id !== action.payload)
        },
        // Clear favourites when the user logs out
        clearFavourites: () => {
            return []
        }
    }
})

export const { setFavourites, addFavourite, removeFavourite, clearFavourites } = favouritesSlice.actions
export default favouritesSlice.reducer
