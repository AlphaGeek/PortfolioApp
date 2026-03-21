import { test, expect } from "@playwright/test"

const mockSearchResults = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "AABA", name: "Altaba Inc." },
]

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("search box is visible in header", async ({ page }) => {
    const searchBox = page.locator(".search-box")
    await expect(searchBox).toBeVisible()
  })

  test("search input field accepts text input", async ({ page }) => {
    const input = page.locator(".search-box input")
    await input.fill("AAPL")
    await expect(input).toHaveValue("AAPL")
  })

  test("search button is visible", async ({ page }) => {
    const searchButton = page.locator(".search-button")
    await expect(searchButton).toBeVisible()
    await expect(searchButton).toContainText("search")
  })

  test("clicking search button calls the API and shows results", async ({
    page,
  }) => {
    await page.route("**/api/v1/search/AAPL", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSearchResults),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("AAPL")

    const searchButton = page.locator(".search-button span")
    await searchButton.click()

    // Results should appear
    const results = page.locator(".search-results-item")
    await expect(results).toHaveCount(3)
  })

  test("pressing Enter in search input triggers search", async ({ page }) => {
    await page.route("**/api/v1/search/AAPL", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSearchResults),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("AAPL")
    await input.press("Enter")

    const results = page.locator(".search-results-item")
    await expect(results).toHaveCount(3)
  })

  test("search results display company name and symbol", async ({ page }) => {
    await page.route("**/api/v1/search/AAPL", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSearchResults),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("AAPL")
    await input.press("Enter")

    const firstResult = page.locator(".search-results-item").first()
    await expect(firstResult).toContainText("Apple Inc.")
    await expect(firstResult).toContainText("AAPL")
  })

  test("clicking a search result navigates to market data page", async ({
    page,
  }) => {
    await page.route("**/api/v1/search/AAPL", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSearchResults),
      })
    })

    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { time: "2024-01-02", open: 185.0, high: 188.0, low: 183.0, close: 187.0 },
        ]),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("AAPL")
    await input.press("Enter")

    const firstResult = page.locator(".search-results-item").first()
    await firstResult.click()

    await expect(page).toHaveURL("/market-data/AAPL")
  })

  test("search results are hidden after selecting a result", async ({
    page,
  }) => {
    await page.route("**/api/v1/search/AAPL", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockSearchResults),
      })
    })

    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("AAPL")
    await input.press("Enter")

    const firstResult = page.locator(".search-results-item").first()
    await firstResult.click()

    // After navigation, search results should not be visible
    await expect(page.locator(".search-results-item")).toHaveCount(0)
  })

  test("empty search results shows no result items", async ({ page }) => {
    await page.route("**/api/v1/search/ZZZZ", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("ZZZZ")
    await input.press("Enter")

    await expect(page.locator(".search-results-item")).toHaveCount(0)
  })

  test("API failure returns no results gracefully", async ({ page }) => {
    await page.route("**/api/v1/search/**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      })
    })

    const input = page.locator(".search-box input")
    await input.fill("ERROR")
    await input.press("Enter")

    // Should not show any results or crash
    await expect(page.locator(".search-results-item")).toHaveCount(0)
  })
})
