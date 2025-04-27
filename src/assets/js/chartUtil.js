export const getCloseData = (data) => {
  return data["Weekly Time Series"].map((item) => {
    return item["4. close"]
  })
}