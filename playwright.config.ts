import { defineConfig } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 *
 * Strategia uruchamiania:
 * - Testy korzystają z localStorage jako storage driver,
 *   dzięki czemu nie wymagają połączenia z Firebase.
 * - Autoryzacja jest obchodzona przez wstrzyknięcie sesji
 *   użytkownika do localStorage przed załadowaniem strony
 *   (patrz: e2e/helpers/auth.ts).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 15_000,
  },
})
