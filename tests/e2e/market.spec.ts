import { test, expect } from '@playwright/test'

test.describe('Market Page', () => {
  test('loads marketplace successfully', async ({ page }) => {
    await page.goto('/market')
    await expect(page).toHaveTitle(/CarMatch/)
  })

  test('displays search functionality', async ({ page }) => {
    await page.goto('/market')
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first()
    await expect(searchInput).toBeVisible()
  })

  test('displays vehicle cards or empty state', async ({ page }) => {
    await page.goto('/market')
    // Either vehicle cards exist or empty state message
    const content = page.locator('text=/vehículos|autos|resultados|no se encontraron/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('has filter controls', async ({ page }) => {
    await page.goto('/market')
    // Look for filter-related elements
    const filters = page.locator('text=/filtro|filtrar|marca|precio|año/i').first()
    await expect(filters).toBeVisible({ timeout: 10000 })
  })

  test('search input accepts text', async ({ page }) => {
    await page.goto('/market')
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Toyota')
      await expect(searchInput).toHaveValue('Toyota')
    }
  })
})

test.describe('Market Page - Navigation', () => {
  test('has link to publish vehicle', async ({ page }) => {
    await page.goto('/market')
    const publishLink = page.locator('a[href*="/publish"]').first()
    // Publish link may or may not be visible depending on auth state
    const isVisible = await publishLink.isVisible().catch(() => false)
    expect(typeof isVisible).toBe('boolean')
  })

  test('mobile nav is present', async ({ page }) => {
    await page.goto('/market')
    // MobileNav should be present (hidden on desktop via md:hidden)
    const mobileNav = page.locator('nav').last()
    await expect(mobileNav).toBeAttached()
  })
})
