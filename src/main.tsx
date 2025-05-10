import * as ReactDOM from "react-dom/client"
import "./index.css"
import { store } from "./store/index"
import { Provider } from "react-redux"
import * as React from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import localforage from "localforage"
import Router from "@/routing/index.tsx"
import { RouterProvider } from "react-router-dom"

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
        <RouterProvider router={Router} />
      </Provider>
    </React.StrictMode>
  </GoogleOAuthProvider>
)
