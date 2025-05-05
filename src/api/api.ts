import axios from "axios";
import localforage from "localforage"
import jwtDecode from "jwt-decode"

export const $axios = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  },
  withCredentials: false
})

$axios.interceptors.request.use(async function (config) {
  const token = await localforage.getItem("portfolio-token")
  // no token means the request does not require authentication, user not logged in
  if (!token) {
    return config;
  }
  // user must be logged in, check if token is expired
  const decodedToken = jwtDecode<any>(token);
  if (decodedToken.exp < Date.now() / 1000) {
    const controller = new AbortController();
    controller.abort()
    window.location.href = "/login"
  }
  config.headers.Authorization =  `Bearer ${token}`
  return config;
})