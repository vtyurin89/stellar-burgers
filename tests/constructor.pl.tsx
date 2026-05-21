import path from 'path';
import { test, expect } from '@playwright/test';

const harPath = path.join(__dirname, '../e2e/hars/ingredients.har');

test.describe('Перехват запроса ингредиентов', () => {
  test('должен записать HAR-файл', async ({ page }) => {
    await page.routeFromHAR(harPath, {
      url: '**/ingredients',
      update: false
    });
  
    await page.goto('/');
  
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();
    await expect(page.getByText('Краторная булка N-200i')).toBeVisible();
    await expect(
      page.getByText('Биокотлета из марсианской Магнолии')
    ).toBeVisible();
  });
});

test.describe('Тестирование модального окна', () => {
  test('Проверка - открытие модального окна ингредиента', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Краторная булка N-200i').click();
    await expect(page.getByText('Ингредиенты')).toBeVisible();
  });

  test('Проверка - закрытие модального окна ингредиента по клику на крестик', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Краторная булка N-200i').click();

    const modalHeader = page.getByRole('heading', { name: 'Ингредиенты' }).locator('..');
    await modalHeader.locator('button svg').click();

    await expect(page.getByRole('heading', { name: 'Ингредиенты' })).not.toBeVisible();
  });

  test('Проверка - закрытие модального окна ингредиента по клику на overlay', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Краторная булка N-200i').click();
    await expect(page.getByRole('heading', { name: 'Ингредиенты' })).toBeVisible();
    const overlay = page.locator('#modals > div').last();
    await overlay.click({ position: { x: 10, y: 10 } });
    await expect(page.getByRole('heading', { name: 'Ингредиенты' })).not.toBeVisible();
  });
});