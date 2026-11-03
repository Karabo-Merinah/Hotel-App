import { createSlice } from "@reduxjs/toolkit";
import type { AuthState, User } from "../types/auth";

// Get the saved user and token from localStorage
const savedUser = localStorage.getItem("user")
const savedToken = localStorage.getItem("token")

//sets the initial authentication state
const initialState: AuthState = {
    user: savedUser ? JSON.parse(savedUser) : null,
    token: savedToken,
    isAuthenticated: savedToken!==null && savedUser !==null
}
//creates a slice to manage user authentication
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // updates the authentication state after successfull login or register 

        loginSuccess: (state, action: { payload: { user: User, token: string } }) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        },

        //clears the authentication state when user logs out .

        logout: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
        }
    }
})

export default authSlice.reducer
export const { loginSuccess, logout } = authSlice.actions