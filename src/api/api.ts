import axios from "axios";
import * as localforage from "localforage"
import jwtDecode from "jwt-decode"

export const $axios = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
})

$axios.interceptors.request.use(async function (config) {
  const token = await localforage.getItem("portfolio-token")
  if (!token) {
    return config;
  }
  //console.log("token", token)
  const decodedToken = jwtDecode<any>(token.toString());
  if (decodedToken.exp > Date.now() / 1000) {
    config.headers.Authorization =  `Bearer ${token}`
  } 
  return config;
})