import path from 'path';
import { test, expect, Page, BrowserContext } from '@playwright/test';

const harsDir = path.join(__dirname, '../e2e/hars');
const mockUserName = 'Test User';
const mockOrderNumber = '12345';
const mockBunName = 'Краторная булка N-200i';
const mockMainName = 'Биокотлета из марсианской Магнолии';

function getConstructor(page: Page) {
  return page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' })
  });
}

async function setupIngredientsMock(page: Page) {
  await page.routeFromHAR(path.join(harsDir, 'ingredients.har'), {
    url: '**/ingredients',
    update: false
  });
}

async function addIngredientFromList(page: Page, name: string) {
  const card = page.locator('li').filter({ hasText: name });
  await card.getByRole('button', { name: 'Добавить' }).click();
}

async function buildFullBurger(page: Page) {
  await addIngredientFromList(page, mockBunName);
  await addIngredientFromList(page, mockMainName);
}

async function expectEmptyConstructor(page: Page) {
  const constructor = getConstructor(page);
  await expect(constructor.getByText('Выберите булки')).toHaveCount(2);
  await expect(constructor.getByText('Выберите начинку')).toBeVisible();
}

async function expectFullBurgerInConstructor(page: Page) {
  const constructor = getConstructor(page);
  await expect(constructor.getByText(`${mockBunName} (верх)`)).toBeVisible();
  await expect(constructor.getByText(`${mockBunName} (низ)`)).toBeVisible();
  await expect(constructor.locator('ul li').filter({ hasText: mockMainName })).toBeVisible();
  await expect(constructor.getByText('Выберите булки')).not.toBeVisible();
  await expect(constructor.getByText('Выберите начинку')).not.toBeVisible();
}

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
    await setupIngredientsMock(page);

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

  test('полный сценарий создания заказа', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();

    await buildFullBurger(page);
    await expectFullBurgerInConstructor(page);

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

    await expectEmptyConstructor(page);

    await page.locator('#modals').getByRole('button').click();

    await expect(
      page.getByRole('heading', { name: mockOrderNumber })
    ).not.toBeVisible();
    await expectEmptyConstructor(page);
  });
});

test.describe('Добавление ингредиентов в конструктор', () => {
  test.beforeEach(async ({ page }) => {
    await setupIngredientsMock(page);
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Соберите бургер' })
    ).toBeVisible();
  });

  test('добавление булки и начинки в конструктор', async ({ page }) => {
    await expectEmptyConstructor(page);

    await addIngredientFromList(page, mockBunName);
    const constructor = getConstructor(page);

    await expect(constructor.getByText(`${mockBunName} (верх)`)).toBeVisible();
    await expect(constructor.getByText(`${mockBunName} (низ)`)).toBeVisible();
    await expect(constructor.getByText('Выберите булки')).not.toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).toBeVisible();

    await addIngredientFromList(page, mockMainName);

    await expect(
      constructor.locator('ul li').filter({ hasText: mockMainName })
    ).toBeVisible();
    await expect(constructor.getByText('Выберите начинку')).not.toBeVisible();
  });
});

test.describe('Тестирование модального окна', () => {
  test.beforeEach(async ({ page }) => {
    await setupIngredientsMock(page);
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
