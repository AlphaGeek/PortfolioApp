import { test, expect } from "@playwright/test"

test.describe("AI Assistant (AskAI)", () => {
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

  test("Ask AI widget is visible", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    await expect(askAIWidget).toBeVisible()
  })

  test("Ask AI widget has an input field", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const input = askAIWidget.locator("input")
    await expect(input).toBeVisible()
  })

  test("Ask AI input has default Claude placeholder", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const input = askAIWidget.locator("input")
    await expect(input).toHaveAttribute("placeholder", "Ask Claude a question...")
  })

  test("Ask AI widget has an Ask button", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const askButton = askAIWidget.locator("button", { hasText: "Ask" })
    await expect(askButton).toBeVisible()
  })

  test("Ask AI widget has a read-only textarea for the response", async ({
    page,
  }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const textarea = askAIWidget.locator("textarea")
    await expect(textarea).toBeVisible()
    await expect(textarea).toHaveAttribute("readonly", "")
  })

  test("Ask AI settings opens model selection", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const settingsIcon = askAIWidget.locator(".pi-cog")
    await settingsIcon.click()

    // AI model selection should appear
    const claudeLabel = page.getByText("Claude").first()
    await expect(claudeLabel).toBeVisible()
  })

  test("Claude radio button is selected by default", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const settingsIcon = askAIWidget.locator(".pi-cog")
    await settingsIcon.click()

    const claudeRadio = page.locator("#claude")
    await expect(claudeRadio).toBeChecked()
  })

  test("can switch to ChatGPT model", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const settingsIcon = askAIWidget.locator(".pi-cog")

    // Open settings and click ChatGPT radio
    await settingsIcon.click()
    await page.locator("#chatgpt").click()

    // The popup closes after selection; reopen to verify ChatGPT is now checked
    await settingsIcon.click()
    await expect(page.locator("#chatgpt")).toBeChecked()
  })

  test("switching to ChatGPT updates the placeholder", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const settingsIcon = askAIWidget.locator(".pi-cog")
    await settingsIcon.click()

    const chatGPTRadio = page.locator("#chatgpt")
    await chatGPTRadio.click()

    // Close settings by clicking elsewhere and check placeholder
    await page.keyboard.press("Escape")
    await page.waitForTimeout(200)

    const input = askAIWidget.locator("input")
    await expect(input).toHaveAttribute("placeholder", "Ask ChatGPT a question...")
  })

  test("can type a question in the input", async ({ page }) => {
    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const input = askAIWidget.locator("input")
    await input.fill("What is the current trend for AAPL?")
    await expect(input).toHaveValue("What is the current trend for AAPL?")
  })

  test("pressing Enter in AI input triggers the ask action", async ({
    page,
  }) => {
    let apiCalled = false
    await page.route("**/api/v1/ai/askClaude", (route) => {
      apiCalled = true
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify("AAPL is showing an upward trend."),
      })
    })

    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const input = askAIWidget.locator("input")
    await input.fill("What is the trend?")
    await input.press("Enter")

    await page.waitForTimeout(500)
    expect(apiCalled).toBe(true)
  })

  test("clicking Ask button calls Claude API and shows response", async ({
    page,
  }) => {
    await page.route("**/api/v1/ai/askClaude", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify("AAPL has strong fundamentals."),
      })
    })

    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const input = askAIWidget.locator("input")
    await input.fill("Tell me about AAPL")

    const askButton = askAIWidget.locator("button", { hasText: "Ask" })
    await askButton.click()

    await page.waitForTimeout(500)
    const textarea = askAIWidget.locator("textarea")
    await expect(textarea).toHaveValue("AAPL has strong fundamentals.")
  })

  test("empty query does not call the AI API", async ({ page }) => {
    let apiCalled = false
    await page.route("**/api/v1/ai/**", (route) => {
      apiCalled = true
      route.fulfill({ status: 200, body: "{}" })
    })

    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const askButton = askAIWidget.locator("button", { hasText: "Ask" })
    await askButton.click()

    await page.waitForTimeout(300)
    expect(apiCalled).toBe(false)
  })

  test("switching model clears the previous answer", async ({ page }) => {
    await page.route("**/api/v1/ai/askClaude", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify("Some Claude answer."),
      })
    })

    const askAIWidget = page.locator(".widget").filter({ hasText: "Ask AI" })
    const input = askAIWidget.locator("input")
    await input.fill("Question")
    const askButton = askAIWidget.locator("button", { hasText: "Ask" })
    await askButton.click()
    await page.waitForTimeout(300)

    // Now switch to ChatGPT via settings
    const settingsIcon = askAIWidget.locator(".pi-cog")
    await settingsIcon.click()
    const chatGPTRadio = page.locator("#chatgpt")
    await chatGPTRadio.click()

    const textarea = askAIWidget.locator("textarea")
    await expect(textarea).toHaveValue("")
  })
})
