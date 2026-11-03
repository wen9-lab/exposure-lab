import { test, expect } from '@playwright/test'

test('完整档调整、页面切换和本地保存', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '完整 1 档计算器' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/desktop.png', fullPage: true })
  await page.getByRole('button', { name: '光圈前一档' }).click()
  await expect(page.getByText('+1.00 EV')).toBeVisible()
  await page.reload()
  await expect(page.getByText('f/2.8', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: /曝光知识库/ }).click()
  await expect(page.getByRole('heading', { name: '曝光知识库' })).toBeVisible()
  await page.getByRole('button', { name: /档位速查表/ }).click()
  await expect(page.getByRole('heading', { name: '曝光档位速查表' })).toBeVisible()
})

test('窄屏仍可操作两个计算器', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '完整 1 档计算器' })).toBeVisible()
  await page
    .locator('.mobile-nav')
    .getByRole('button', { name: /1\/3档/ })
    .click()
  await expect(page.getByRole('heading', { name: '精细 1/3 档计算器' })).toBeVisible()
  await page.screenshot({ path: 'artifacts/mobile.png', fullPage: true })
})

test('预设保存、刷新与 JSON 备份', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '光圈前一档' }).click()
  page.once('dialog', (dialog) => dialog.accept('我的人像基准'))
  await page.getByRole('button', { name: '保存预设' }).click()
  await page.getByRole('button', { name: /设置与预设/ }).click()
  await expect(page.getByText('我的人像基准')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: /设置与预设/ }).click()
  await expect(page.getByText('我的人像基准')).toBeVisible()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出 JSON' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('exposure-lab-backup.json')
})

test('参数变化自动记录本地计算历史', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '快门后一档' }).click()
  await page.getByRole('button', { name: /设置与预设/ }).click()
  await expect(page.getByRole('heading', { name: '计算历史 1' })).toBeVisible()
})

test('默认基准可自定义，胶片阳光 16 沿用胶卷 ISO', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '光圈前一档' }).click()
  await page.getByRole('button', { name: /设置与预设/ }).click()
  await page.getByRole('button', { name: '设为当前组合' }).first().click()
  await page.getByRole('button', { name: /完整档计算器/ }).click()
  await page.getByRole('button', { name: '恢复默认基准' }).click()
  await expect(page.locator('.comparison').getByText('f/2.8').first()).toBeVisible()
  await page.getByRole('button', { name: '胶片相机' }).click()
  await page.getByLabel('胶卷 ISO').fill('200')
  await page.getByRole('button', { name: /应用为基准/ }).click()
  await expect(page.locator('.comparison').getByText('ISO 200').first()).toBeVisible()
})
