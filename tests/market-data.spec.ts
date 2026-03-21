import { test, expect } from "@playwright/test"

const mockCandlestickData = [
  { time: "2024-01-02", open: 185.0, high: 188.0, low: 183.0, close: 187.0 },
  { time: "2024-01-03", open: 187.0, high: 190.0, low: 185.0, close: 189.0 },
  { time: "2024-01-04", open: 189.0, high: 192.0, low: 186.0, close: 191.0 },
  { time: "2024-01-05", open: 191.0, high: 194.0, low: 188.0, close: 192.0 },
  { time: "2024-01-08", open: 192.0, high: 196.0, low: 190.0, close: 195.0 },
]

test.describe("Market Data Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCandlestickData),
      })
    })
  })

  test("renders market data page for a given symbol", async ({ page }) => {
    await page.goto("/market-data/AAPL")
    await expect(page).toHaveURL("/market-data/AAPL")
  })

  test("renders the price chart widget", async ({ page }) => {
    await page.goto("/market-data/AAPL")
    const widgetHeader = page.locator(".widget").filter({ hasText: "Price Chart" })
    await expect(widgetHeader).toBeVisible()
  })

  test("renders the Ask AI widget", async ({ page }) => {
    await page.goto("/market-data/AAPL")
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    await expect(askAIWidget).toBeVisible()
  })

  test("chart widget has settings gear icon", async ({ page }) => {
    await page.goto("/market-data/AAPL")
    const settingsIcon = page.locator(".widget").first().locator(".pi-cog")
    await expect(settingsIcon).toBeVisible()
  })

  test("widget settings menu opens on gear click", async ({ page }) => {
    await page.goto("/market-data/AAPL")
    // Find the chart widget's settings icon
    const priceChartWidget = page.locator(".widget").filter({ hasText: "Price Chart" })
    const settingsIcon = priceChartWidget.locator(".pi-cog")
    await settingsIcon.click()

    const exportMenuItem = page.locator("#chartSettingsMenu")
    await expect(exportMenuItem).toBeVisible()
  })

  test("renders chart container element", async ({ page }) => {
    await page.goto("/market-data/AAPL")
    // Wait for the lightweight-charts canvas to be created
    await page.waitForTimeout(500)
    // lightweight-charts creates multiple canvases; check the first one is visible
    const chartContainer = page.locator(".widget").filter({ hasText: "Price Chart" }).locator("canvas").first()
    await expect(chartContainer).toBeVisible()
  })

  test("calls the time series API for the symbol", async ({ page }) => {
    let apiCalled = false
    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      apiCalled = true
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCandlestickData),
      })
    })

    await page.goto("/market-data/AAPL")
    await page.waitForTimeout(500)
    expect(apiCalled).toBe(true)
  })

  test("works with different stock symbols", async ({ page }) => {
    await page.route("**/api/v1/issuer/MSFT/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockCandlestickData),
      })
    })

    await page.goto("/market-data/MSFT")
    await expect(page).toHaveURL("/market-data/MSFT")
    const priceChartWidget = page.locator(".widget").filter({ hasText: "Price Chart" })
    await expect(priceChartWidget).toBeVisible()
  })
})
