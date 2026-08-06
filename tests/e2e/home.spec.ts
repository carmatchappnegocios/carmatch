import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
    test('loads successfully', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle(/CarMatch/)
    })

    test('redirects to market', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveURL(/market/)
    })

    test('has CarMatch branding', async ({ page }) => {
        await page.goto('/market')
        await expect(page.locator('text=CarMatch').first()).toBeVisible()
    })
})

test.describe('Blog page', () => {
    test('loads blog list', async ({ page }) => {
        await page.goto('/blog')
        await expect(page.locator('text=Blog').first()).toBeVisible()
    })

    test('blog posts are clickable', async ({ page }) => {
        await page.goto('/blog')
        const firstPost = page.locator('a[href*="/blog/"]').first()
        await expect(firstPost).toBeVisible()
    })
})

test.describe('Market page', () => {
    test('loads marketplace', async ({ page }) => {
        await page.goto('/market')
        await expect(page.locator('text=Market').first()).toBeVisible()
    })
})

test.describe('Static pages', () => {
    test('terms page loads', async ({ page }) => {
        await page.goto('/terms')
        await expect(page.locator('text=Términos').first()).toBeVisible()
    })

    test('privacy page loads', async ({ page }) => {
        await page.goto('/privacy')
        await expect(page.locator('text=Privacidad').first()).toBeVisible()
    })
})
