import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e-offline',
  use: {
    baseURL: 'https://wen9-lab.github.io',
    browserName: 'chromium',
    launchOptions: {
      executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    },
  },
  reporter: 'list',
})
