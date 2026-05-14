import "./AppHeader.scss"
import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import SearchBox from "@/components/Search/SearchBox"
import {
  setIsAuthenticated,
  setJwtToken,
  setUserInfo,
} from "@/store/slices/userSlice"
import { fetchPortfolio, createPortfolio } from "@/store/slices/portfolioSlice"
import jwt_decode from "jwt-decode"
import { GoogleLogin } from "@react-oauth/google"
import { Link } from "react-router-dom"
import * as localforage from "localforage"

function AppHeader() {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated)
  const user = useSelector((state: any) => state.user.userInfo)
  const portfolio = useSelector((state: any) => state.portfolio.portfolio)
  const portfolioLoaded = useSelector((state: any) => state.portfolio.loaded)
  const dispatch = useDispatch<any>()

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPortfolio())
    }
  }, [isAuthenticated])

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

  function handleCreatePortfolio() {
    dispatch(createPortfolio())
  }

  return (
    <div className="app-header bg-stone-100 content-center flex justify-between">
      <div className="app-header-section app-header-left">
        {isAuthenticated && portfolioLoaded && !portfolio && (
          <button className="create-portfolio-btn" onClick={handleCreatePortfolio}>
            + Create Portfolio
          </button>
        )}
        {isAuthenticated && portfolio && (
          <Link to="/portfolio" className="nav-link">
            My Portfolio
          </Link>
        )}
        <Link to="/screener" className="nav-link">
          Screener
        </Link>
        <Link to="/advisor" className="nav-link">
          Advisor
        </Link>
      </div>

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
          />
        )}
      </div>
    </div>
  )
}

export default AppHeader
