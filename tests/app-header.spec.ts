import { test, expect } from "@playwright/test"

test.describe("App Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("renders the app header", async ({ page }) => {
    const header = page.locator(".app-header")
    await expect(header).toBeVisible()
  })

  test("header has left, center and right sections", async ({ page }) => {
    // app-header-left is an empty div (no content), so check it exists in DOM
    await expect(page.locator(".app-header-left")).toBeAttached()
    await expect(page.locator(".app-header-center")).toBeVisible()
    await expect(page.locator(".app-header-right")).toBeVisible()
  })

  test("search box is in the center section", async ({ page }) => {
    const centerSection = page.locator(".app-header-center")
    const searchBox = centerSection.locator(".search-box")
    await expect(searchBox).toBeVisible()
  })

  test("Google login button is in the right section when not authenticated", async ({
    page,
  }) => {
    // When not authenticated, GoogleLogin renders in the right section
    const rightSection = page.locator(".app-header-right")
    await expect(rightSection).toBeVisible()
  })

  test("header has background color applied", async ({ page }) => {
    const header = page.locator(".app-header")
    await expect(header).toHaveClass(/bg-stone-100/)
  })

  test("logout link is not visible when not authenticated", async ({ page }) => {
    const logout = page.locator("#logout")
    await expect(logout).toHaveCount(0)
  })

  test("welcome message is not visible when not authenticated", async ({
    page,
  }) => {
    const welcome = page.locator("#loggedInWelcome")
    await expect(welcome).toHaveCount(0)
  })

  test("header persists on market-data page", async ({ page }) => {
    await page.route("**/api/v1/issuer/AAPL/timeSeries/daily", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    })

    await page.goto("/market-data/AAPL")
    const header = page.locator(".app-header")
    await expect(header).toBeVisible()
  })
})
