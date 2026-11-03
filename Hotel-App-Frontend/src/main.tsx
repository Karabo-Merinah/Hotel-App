import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { GoogleOAuthProvider } from "@react-oauth/google"
import "./index.css"
import App from "./App.tsx"
import { store } from "./app/store.ts"
import { Provider } from "react-redux"

createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
        </Provider>
    </StrictMode>
)