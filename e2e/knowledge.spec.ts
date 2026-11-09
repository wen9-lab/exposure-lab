import { test, expect } from '@playwright/test'

test('knowledge course exposes eight navigable chapters and worked examples', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /曝光知识库/ }).click()

  const chapters = page.locator('.knowledge-chapter')
  await expect(chapters).toHaveCount(8)
  await expect(page.getByRole('heading', { name: '先建立曝光模型' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '一档与 1/3 档的数学' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '场景实战' })).toBeVisible()

  await page.getByRole('link', { name: /阳光 16 与天气扩展/ }).click()
  await expect(page).toHaveURL(/#chapter-sunny-16$/)
  await expect(page.locator('#chapter-sunny-16')).toBeInViewport()

  await expect(page.getByText('+0.029 EV', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('−0.32 EV', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('EI 800', { exact: false }).first()).toBeVisible()
  await expect(page.locator('.scene-case')).toHaveCount(6)
})

test('knowledge course remains readable at phone width without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('.mobile-nav').getByRole('button', { name: /知识/ }).click()
  await expect(page.getByRole('heading', { name: '场景实战' })).toBeVisible()
  const widths = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))
  expect(widths.content).toBeLessThanOrEqual(widths.viewport)
  await expect(page.locator('.knowledge-table-wrap').first()).toBeVisible()
})
