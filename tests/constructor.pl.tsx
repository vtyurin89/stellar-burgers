import path from 'path';
import { test, expect, Page, BrowserContext } from '@playwright/test';

const harsDir = path.join(__dirname, '../e2e/hars');
const mockUserName = 'Test User';
const mockOrderNumber = '12345';

async function setupApiMocks(page: Page) {
  await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
    url: '**/ingredients',
    update: false
  });
  await page.routeFromHAR(path.join(harsDir, 'user.har'), {
    url: '**/auth/user',
    update: false
  });
  await page.routeFromHAR(path.join(harsDir, 'orders.har'), {
    url: '**/orders',
    update: false
  });
}

async function setAuthCookies(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'accessToken',
      value: 'mock-access-token',
      url: 'http://localhost:4000'
    }
  ]);
}

test.describe('Перехват запроса ингредиентов', () => {
  test('должен записать HAR-файл', async ({ page }) => {
    await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
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

test.describe('Моки HAR: пользователь и заказ', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupApiMocks(page);
    await setAuthCookies(context);
  });

  test('моковые данные ответа на запрос данных пользователя', async ({
    page
  }) => {
    const userResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/user') && response.status() === 200
    );

    await page.goto('/');

    const userResponse = await userResponsePromise;
    const userBody = await userResponse.json();

    expect(userBody.success).toBe(true);
    expect(userBody.user).toEqual({
      email: 'test@test.com',
      name: mockUserName
    });
  });

  test('моковые данные ответа на запрос создания заказа', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();

    const bunCard = page.locator('li').filter({
      hasText: 'Краторная булка N-200i'
    });
    await bunCard.getByRole('button', { name: 'Добавить' }).click();

    const orderResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/orders') &&
        response.request().method() === 'POST' &&
        response.status() === 200
    );

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const orderResponse = await orderResponsePromise;
    const orderBody = await orderResponse.json();

    expect(orderBody.success).toBe(true);
    expect(orderBody.order.number).toBe(Number(mockOrderNumber));

    await expect(
      page.getByRole('heading', { name: mockOrderNumber })
    ).toBeVisible();
    await expect(
      page.getByText('идентификатор заказа', { exact: true })
    ).toBeVisible();
  });
});

test.describe('Тестирование модального окна', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
      url: '**/ingredients',
      update: false
    });
  });

  test('Проверка - открытие модального окна ингредиента', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Краторная булка N-200i').click();
    await expect(page.getByText('Ингредиенты')).toBeVisible();
  });

  test('Проверка - закрытие модального окна ингредиента по клику на крестик', async ({
    page
  }) => {
    await page.goto('/');
    await page.getByText('Краторная булка N-200i').click();

    const modalHeader = page
      .getByRole('heading', { name: 'Ингредиенты' })
      .locator('..');
    await modalHeader.locator('button svg').click();

    await expect(
      page.getByRole('heading', { name: 'Ингредиенты' })
    ).not.toBeVisible();
  });

  test('Проверка - закрытие модального окна ингредиента по клику на overlay', async ({
    page
  }) => {
    await page.goto('/');
    await page.getByText('Краторная булка N-200i').click();
    await expect(
      page.getByRole('heading', { name: 'Ингредиенты' })
    ).toBeVisible();

    const overlay = page.locator('#modals > div').last();
    await overlay.click({ position: { x: 10, y: 10 } });

    await expect(
      page.getByRole('heading', { name: 'Ингредиенты' })
    ).not.toBeVisible();
  });
});
