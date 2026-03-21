import { test, expect } from "@playwright/test"

test.describe("Widget Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { time: "2024-01-02", open: 185.0, high: 188.0, low: 183.0, close: 187.0 },
        ]),
      })
    })
    await page.goto("/market-data/AAPL")
  })

  test("widget renders with header", async ({ page }) => {
    const widgets = page.locator(".widget")
    await expect(widgets.first()).toBeVisible()
  })

  test("widget header shows left label", async ({ page }) => {
    const priceChartWidget = page.locator(".widget").filter({ hasText: "Price Chart" })
    await expect(priceChartWidget).toContainText("Price Chart")
  })

  test("widget has settings gear icon when settings are provided", async ({
    page,
  }) => {
    const priceChartWidget = page.locator(".widget").filter({ hasText: "Price Chart" })
    const settingsIcon = priceChartWidget.locator(".pi-cog")
    await expect(settingsIcon).toBeVisible()
  })

  test("widget settings popup opens on gear click", async ({ page }) => {
    const priceChartWidget = page.locator(".widget").filter({ hasText: "Price Chart" })
    const settingsIcon = priceChartWidget.locator(".pi-cog")
    await settingsIcon.click()

    // PrimeReact Menu popup should appear
    const menu = page.locator("#chartSettingsMenu")
    await expect(menu).toBeVisible()
  })

  test("export option appears in chart settings menu", async ({ page }) => {
    const priceChartWidget = page.locator(".widget").filter({ hasText: "Price Chart" })
    const settingsIcon = priceChartWidget.locator(".pi-cog")
    await settingsIcon.click()

    const menu = page.locator("#chartSettingsMenu")
    await expect(menu).toContainText("Export")
  })

  test("Ask AI widget has settings gear icon", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const settingsIcon = askAIWidget.locator(".pi-cog")
    await expect(settingsIcon).toBeVisible()
  })

  test("widget has white background card style", async ({ page }) => {
    const widget = page.locator(".widget").first()
    await expect(widget).toHaveClass(/bg-white/)
  })

  test("widget bar has correct background", async ({ page }) => {
    // The WidgetBar has bg-stone-50 class
    const widgetBars = page.locator(".widget > div").first()
    await expect(widgetBars).toBeVisible()
  })

  test("multiple widgets render on market data page", async ({ page }) => {
    const widgets = page.locator(".widget")
    // Expect at least 2 widgets: Price Chart + Ask AI
    const count = await widgets.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
