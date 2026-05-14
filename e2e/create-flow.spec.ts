import { test, expect } from '@playwright/test'
import { injectTestSession, clearTestData } from './helpers/auth'


// Ciąg operacji: Logowanie → Projekt → Historyjka → Zadanie.
test.describe('Create Flow', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestSession(page)
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('tworzy projekt, historyjkę i zadanie', async ({ page }) => {
    // ── 1. Tworzenie Projektu ──
    await page.goto('/projects')

    await page.fill('input[placeholder="Nazwa"]', 'Projekt E2E')
    await page.fill('input[placeholder="Opis"]', 'Opis testowego projektu')
    await page.click('button:has-text("Dodaj projekt")')

    // Asercja: projekt widoczny na liście (szukamy w nagłówku karty)
    await expect(page.getByRole('heading', { name: 'Projekt E2E' })).toBeVisible()

    // Ustaw jako aktywny
    await page.click('button:has-text("Ustaw jako główny")')
    await expect(page.locator('button:has-text("Aktywny")')).toBeVisible()

    // ── 2. Tworzenie Historyjki ──
    await page.goto('/stories')

    await page.fill('input[placeholder="Nazwa"]', 'Historyjka E2E')
    await page.fill('textarea[placeholder="Opis"]', 'Opis testowej historyjki')
    await page.click('button:has-text("Dodaj historyjke")')

    // Asercja: historyjka widoczna w kolumnie TODO
    await expect(page.getByRole('heading', { name: 'Historyjka E2E' }).first()).toBeVisible()

    // ── 3. Tworzenie Zadania z poziomu historyjki ──
    await page.click('button:has-text("+ Dodaj zadanie")')

    await page.fill('input[placeholder="Nazwa zadania"]', 'Zadanie E2E')
    await page.fill('textarea[placeholder="Opis zadania"]', 'Opis testowego zadania')
    await page.fill('input[placeholder="Czas (np. 8h)"]', '4h')
    await page.click('button:has-text("Dodaj zadanie")')

    // Asercja: zadanie widoczne na tablicy Kanban
    await page.goto('/tasks')

    await expect(page.getByRole('heading', { name: 'Zadanie E2E' })).toBeVisible()
  })
})
