import axios from "axios";

let token = sessionStorage.getItem("portfolio-token")
  
export const $axios = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  },
  withCredentials: false
})

$axios.interceptors.request.use(function (config) {
  if (!token) {
    //token = useSelector((state: any) => state.user.jwtToken)
    token = sessionStorage.getItem("portfolio-token")
  }
  config.headers.Authorization =  `Bearer ${token}`
  return config;
})