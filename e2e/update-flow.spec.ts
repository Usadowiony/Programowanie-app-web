import { test, expect } from '@playwright/test'
import { injectTestSession, clearTestData } from './helpers/auth'

// Ciąg operacji: Edycja zadania → Zmiana statusu → Edycja historyjki → Edycja projektu.
test.describe('Update Flow', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestSession(page)

    // Setup: Utwórz projekt, historyjkę i zadanie
    await page.goto('/projects')

    await page.fill('input[placeholder="Nazwa"]', 'Projekt Update')
    await page.fill('input[placeholder="Opis"]', 'Opis update')
    await page.click('button:has-text("Dodaj projekt")')
    await expect(page.getByRole('heading', { name: 'Projekt Update' })).toBeVisible()
    await page.click('button:has-text("Ustaw jako główny")')

    await page.goto('/stories')

    await page.fill('input[placeholder="Nazwa"]', 'Historyjka Update')
    await page.fill('textarea[placeholder="Opis"]', 'Opis update historyjki')
    await page.click('button:has-text("Dodaj historyjke")')
    await expect(page.getByRole('heading', { name: 'Historyjka Update' }).first()).toBeVisible()

    await page.click('button:has-text("+ Dodaj zadanie")')
    await page.fill('input[placeholder="Nazwa zadania"]', 'Zadanie Update')
    await page.fill('textarea[placeholder="Opis zadania"]', 'Opis update zadania')
    await page.fill('input[placeholder="Czas (np. 8h)"]', '2h')
    await page.click('button:has-text("Dodaj zadanie")')
  })

  test.afterEach(async ({ page }) => {
    await clearTestData(page)
  })

  test('zmienia status historyjki i weryfikuje przejście między kolumnami', async ({ page }) => {
    await page.goto('/stories')

    // Historyjka powinna być w TODO
    await expect(page.getByRole('heading', { name: 'Historyjka Update' }).first()).toBeVisible()

    // Przenieś do DOING
    await page.click('button:has-text("→ Doing")')
    await page.waitForTimeout(300)

    // Historyjka powinna teraz być widoczna w sekcji DOING
    const doingSection = page.locator('div', { has: page.locator('h2:has-text("DOING")') })
    await expect(doingSection.getByRole('heading', { name: 'Historyjka Update' })).toBeVisible()
  })

  test('edytuje projekt (zmiana nazwy i opisu)', async ({ page }) => {
    await page.goto('/projects')

    // Klikamy edytuj – prompt jest obsługiwany przez page.on('dialog')
    page.on('dialog', async (dialog) => {
      if (dialog.message().includes('nazwę')) {
        await dialog.accept('Projekt Zmieniony')
      } else if (dialog.message().includes('opis')) {
        await dialog.accept('Nowy opis projektu')
      }
    })

    await page.click('button:has-text("Edytuj")')
    await page.waitForTimeout(500)

    // Asercja: nowa nazwa i opis widoczne
    await expect(page.getByRole('heading', { name: 'Projekt Zmieniony' })).toBeVisible()
    await expect(page.getByText('Nowy opis projektu')).toBeVisible()
  })
})
