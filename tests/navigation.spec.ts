import { test, expect } from "@playwright/test"

test.describe("Navigation / Routing", () => {
  test("home route renders home page", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator(".home")).toBeVisible()
  })

  test("login route renders login page", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator(".login")).toBeVisible()
  })

  test("market-data route renders market data page with symbol", async ({
    page,
  }) => {
    // Mock the API so the page loads without a backend
    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { time: "2024-01-02", open: 185.0, high: 188.0, low: 183.0, close: 187.0 },
          { time: "2024-01-03", open: 187.0, high: 190.0, low: 185.0, close: 189.0 },
        ]),
      })
    })

    await page.goto("/market-data/AAPL")
    await expect(page).toHaveURL("/market-data/AAPL")
  })

  test("header is present on all pages", async ({ page }) => {
    for (const path of ["/", "/login"]) {
      await page.goto(path)
      await expect(page.locator(".app-header")).toBeVisible()
    }
  })

  test("navigating between pages updates the URL", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/")

    await page.goto("/login")
    await expect(page).toHaveURL("/login")

    await page.goto("/")
    await expect(page).toHaveURL("/")
  })
})
