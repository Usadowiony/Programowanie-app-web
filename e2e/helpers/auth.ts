import { Page, expect } from '@playwright/test'

/**
 * Rozwiązanie: Bypass na poziomie localStorage.
 * Aplikacja ma dwa tryby storage: localStorage i Firebase.
 * AuthContext czyta profil użytkownika z localStorage (klucz `currentUserProfile`).
 * Wstrzykujemy tam fałszywą sesję przed załadowaniem strony,
 * a storage mode ustawiamy na `localStorage` (klucz `VITE_DATA_STORAGE_MODE_OVERRIDE`).
 * Flaga `E2E_TEST_SESSION=true` informuje AuthProvider, aby pominął
 * Firebase onAuthStateChanged i traktował cache jako źródło sesji.
 */

const TEST_USER = {
  id: 'test-user-e2e-001',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin' as const,
  blocked: false,
  createdAt: new Date().toISOString(),
}

export async function injectTestSession(page: Page) {
  await page.goto('/', { waitUntil: 'commit' })

  await page.evaluate((user) => {
    localStorage.setItem('currentUserProfile', JSON.stringify(user))
    localStorage.setItem('usersCache', JSON.stringify([user]))
    localStorage.setItem('VITE_DATA_STORAGE_MODE_OVERRIDE', 'localStorage')
    localStorage.setItem('E2E_TEST_SESSION', 'true')
  }, TEST_USER)

  await page.goto('/', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('text=Projekty').first()).toBeVisible({ timeout: 10_000 })
}

export async function clearTestData(page: Page) {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

export { TEST_USER }
