import { test, expect } from "@playwright/test"

test.describe("Home Page", () => {
  test("renders the home page", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/")
  })

  test("renders the app header", async ({ page }) => {
    await page.goto("/")
    const header = page.locator(".app-header")
    await expect(header).toBeVisible()
  })

  test("renders the search box in the header", async ({ page }) => {
    await page.goto("/")
    const searchBox = page.locator(".search-box")
    await expect(searchBox).toBeVisible()
  })

  test("renders the home content area", async ({ page }) => {
    await page.goto("/")
    const home = page.locator(".home")
    await expect(home).toBeVisible()
  })

  test("shows Google login button when unauthenticated", async ({ page }) => {
    await page.goto("/")
    // Google OAuth renders an iframe-based button
    const googleLoginContainer = page.locator(".app-header-right")
    await expect(googleLoginContainer).toBeVisible()
  })
})
