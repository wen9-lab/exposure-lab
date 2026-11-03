import { test, expect } from '@playwright/test'

test('网页完成首次缓存后可断网重开并保留计算状态', async ({ page, context }) => {
  await page.goto('/exposure-lab/')
  await expect(page.getByRole('heading', { name: '完整 1 档计算器' })).toBeVisible()
  await page.getByRole('button', { name: '光圈前一档' }).click()
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null)
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: '完整 1 档计算器' })).toBeVisible()
  await expect(page.getByText('f/2.8', { exact: true }).first()).toBeVisible()
})
