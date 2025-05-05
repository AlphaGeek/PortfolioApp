import * as ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { store } from "./store/index"
import { Provider } from "react-redux"
import * as React from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import localforage from "localforage"

localforage.config({
  name: "portfolio",
  storeName: "portfolio_store",
  version: 1.0,
  size: 10 * 1024 * 1024, // 10 MB
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, localforage.WEBSQL], // Preferred storage drivers in order
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="1019566960350-cjkjn2nrf3hri2a3qfdgienuansjbkts.apps.googleusercontent.com">
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  </GoogleOAuthProvider>
)
