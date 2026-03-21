import { test, expect } from "@playwright/test"

test.describe("Login Page", () => {
  test("navigates to login page", async ({ page }) => {
    await page.goto("/login")
    await expect(page).toHaveURL("/login")
  })

  test("shows login required message", async ({ page }) => {
    await page.goto("/login")
    const message = page.locator(".login h2")
    await expect(message).toBeVisible()
    await expect(message).toContainText(
      "You have made a request that requires you to be logged in"
    )
  })

  test("renders login container", async ({ page }) => {
    await page.goto("/login")
    const loginContainer = page.locator(".login")
    await expect(loginContainer).toBeVisible()
  })

  test("still shows app header on login page", async ({ page }) => {
    await page.goto("/login")
    const header = page.locator(".app-header")
    await expect(header).toBeVisible()
  })

  test("still shows search box on login page", async ({ page }) => {
    await page.goto("/login")
    const searchBox = page.locator(".search-box")
    await expect(searchBox).toBeVisible()
  })
})
