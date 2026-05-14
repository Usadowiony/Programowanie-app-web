import { test, expect } from '@playwright/test'
import { injectTestSession, clearTestData } from './helpers/auth'


// Ciąg operacji: Usunięcie Zadania → Usunięcie Historyjki → Usunięcie Projektu.
test.describe('Delete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestSession(page)

    // Setup: Utwórz projekt, historyjkę i zadanie
    await page.goto('/projects')

    await page.fill('input[placeholder="Nazwa"]', 'Projekt Delete')
    await page.fill('input[placeholder="Opis"]', 'Opis do usunięcia')
    await page.click('button:has-text("Dodaj projekt")')
    await expect(page.getByRole('heading', { name: 'Projekt Delete' })).toBeVisible()
    await page.click('button:has-text("Ustaw jako główny")')

    await page.goto('/stories')

    await page.fill('input[placeholder="Nazwa"]', 'Historyjka Delete')
    await page.fill('textarea[placeholder="Opis"]', 'Opis historyjki do usunięcia')
    await page.click('button:has-text("Dodaj historyjke")')
    await expect(page.getByRole('heading', { name: 'Historyjka Delete' }).first()).toBeVisible()

    await page.click('button:has-text("+ Dodaj zadanie")')
    await page.fill('input[placeholder="Nazwa zadania"]', 'Zadanie Delete')
    await page.fill('textarea[placeholder="Opis zadania"]', 'Opis zadania do usunięcia')
    await page.fill('input[placeholder="Czas (np. 8h)"]', '1h')
    await page.click('button:has-text("Dodaj zadanie")')
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('usuwa zadanie, historyjkę i projekt', async ({ page }) => {
    // ── 1. Usunięcie Zadania ──
    await page.goto('/tasks')

    // Klikamy w kartę zadania by przejść do szczegółów
    await page.click('text=Zadanie Delete')

    // Obsługa window.confirm i window.alert
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    await page.click('button:has-text("Usun zadanie")')
    await page.waitForTimeout(500)

    // Powinniśmy wrócić na listę zadań – zadanie powinno zniknąć
    await expect(page.getByRole('heading', { name: 'Zadanie Delete' })).not.toBeVisible()

    // ── 2. Usunięcie Historyjki ──
    await page.goto('/stories')

    await expect(page.getByRole('heading', { name: 'Historyjka Delete' }).first()).toBeVisible()

    // Klikamy Usuń na historyjce
    const storyCard = page.locator('div', { has: page.locator('h3:has-text("Historyjka Delete")') }).first()
    await storyCard.locator('button:has-text("Usuń")').click()
    await page.waitForTimeout(300)

    // Asercja: historyjka zniknęła
    await expect(page.getByRole('heading', { name: 'Historyjka Delete' })).not.toBeVisible()

    // ── 3. Usunięcie Projektu ──
    await page.goto('/projects')

    await expect(page.getByRole('heading', { name: 'Projekt Delete' })).toBeVisible()
    await page.click('button:has-text("Usuń")')
    await page.waitForTimeout(300)

    // Asercja: projekt zniknął z listy
    await expect(page.getByRole('heading', { name: 'Projekt Delete' })).not.toBeVisible()
  })
})
