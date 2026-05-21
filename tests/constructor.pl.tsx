import path from 'path';
import { test, expect } from '@playwright/test';

const harPath = path.join(__dirname, '../e2e/hars/ingredients.har');

// Перехват запроса ингредиентов
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
