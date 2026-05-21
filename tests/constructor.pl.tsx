import { test, expect } from '@playwright/test';

// E2E-тесты конструктора бургера

test('должен записать HAR-файл', async ({ page }) => {
  await page.routeFromHAR('./e2e/hars/users.har', {
    url: '**/users',
    update: true,
  });

  await page.goto('/login');
  
  await expect(page.getByRole('button', { name: /войти/i })).toBeVisible();
}); 