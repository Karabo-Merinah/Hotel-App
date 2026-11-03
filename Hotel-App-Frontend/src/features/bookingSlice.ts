import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { Booking } from "../types/hotel"

const initialState: Booking[] = []

const bookingsSlice = createSlice({
    name: "bookings",
    initialState,
    reducers: {
        setBookings: (_, action: PayloadAction<Booking[]>) => {
            return action.payload
        },
        updateBooking: (state, action: PayloadAction<Booking>) => {
            const index = state.findIndex(booking => booking.id === action.payload.id)
            if (index !== -1) {
                state[index] = action.payload
            }
        },
        clearBookings: () => {
            return []
        },

        addBooking: (state, action: PayloadAction<Booking>) => {
            const index = state.findIndex(booking => booking.id === action.payload.id)
            if (index === -1) {
                state.push(action.payload)
            }
            else {
                state[index] = action.payload
            }
        },
    }
})

export const { setBookings, updateBooking, clearBookings, addBooking } = bookingsSlice.actions
export default bookingsSlice.reducer