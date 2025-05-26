import * as ReactDOM from "react-dom/client"
import "./index.css"
import { store } from "./store/index"
import { Provider } from "react-redux"
import * as React from "react"
import { GoogleOAuthProvider } from "@react-oauth/google"
import localforage from "localforage"
import jwtDecode from "jwt-decode"
import { useDispatch } from "react-redux"
import {
  setIsAuthenticated,
  setJwtToken,
  setUserInfo,
} from "@/store/slices/userSlice"
import App from "./App"

localforage.config({
  name: "portfolio",
  storeName: "portfolio_store",
  version: 1.0,
  size: 10 * 1024 * 1024, // 10 MB
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, localforage.WEBSQL], // Preferred storage drivers in order
})

// check if token in localforage is expired
const token = await localforage.getItem("portfolio-token")
if (token) {
  const decodedToken = jwtDecode<any>(token.toString())
  if (decodedToken.exp < Date.now() / 1000) {
    // token is expired, remove it from localforage, logout user
    localforage.removeItem("portfolio-token")
    const dispatch = useDispatch()
    dispatch(setJwtToken(null))
    dispatch(setUserInfo(null))
    dispatch(setIsAuthenticated(false))
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="1019566960350-cjkjn2nrf3hri2a3qfdgienuansjbkts.apps.googleusercontent.com">
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  </GoogleOAuthProvider>
)
