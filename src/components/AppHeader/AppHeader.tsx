import "./AppHeader.scss"
import { useSelector, useDispatch } from "react-redux"
import SearchBox from "@/components/Search/SearchBox"
import {
  setIsAuthenticated,
  setJwtToken,
  setUserInfo,
} from "../../store/userSlice"
import jwt_decode from "jwt-decode"
import { GoogleLogin } from "@react-oauth/google"
import * as localforage from "localforage"

function AppHeader() {
  const isAuthenticated = useSelector(
    (state: any) => state.user.isAuthenticated
  )
  const user = useSelector((state: any) => state.user.userInfo)
  const dispatch = useDispatch()

  const onSuccess = (response: any) => {
    const user = jwt_decode(response.credential)
    localforage.setItem("portfolio-token", response.credential)
    dispatch(setJwtToken(response.credential))
    dispatch(setUserInfo(user))
    dispatch(setIsAuthenticated(true))
  }
  const onError = () => {
    console.error("Google: Failed to sign in")
  }

  function logout() {
    localforage.removeItem("portfolio-login")
    window.location.reload()
  }

  return (
    <div className="app-header">
      <div className="app-header-section app-header-left"></div>

      <div className="app-header-section app-header-center">
        <SearchBox />
      </div>

      <div className="app-header-section app-header-right">
        {isAuthenticated ? (
          <span>
            <span id="loggedInWelcome">Welcome {user.name}</span>&nbsp;&nbsp;
            <img src={user.picture}></img>
            <span id="logout" onClick={logout}>
              logout
            </span>
          </span>
        ) : (
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            text="signin"
            // Optional: Add more configuration options like `scope`, `prompt`, etc.
          />
        )}
      </div>
    </div>
  )
}

export default AppHeader
