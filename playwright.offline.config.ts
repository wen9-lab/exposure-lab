import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-offline',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    launchOptions: {
      executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    },
  },
  webServer: {
    command: 'npm run preview:pages',
    url: 'http://127.0.0.1:4173/exposure-lab/',
    reuseExistingServer: true,
    timeout: 30000,
  },
  reporter: 'list',
})
