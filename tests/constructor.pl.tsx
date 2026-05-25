import path from 'path';
import { test, expect, Page, BrowserContext } from '@playwright/test';

const harsDir = path.join(__dirname, 'hars');
const mockUserName = 'Test User';
const mockOrderNumber = '12345';
const mockAccessToken = 'mock-access-token';
const mockRefreshToken = 'mock-refresh-token';
const mockBunName = 'Краторная булка N-200i';
const mockBunId = '643d69a5c3f7b9001cfa093c';
const mockMainName = 'Биокотлета из марсианской Магнолии';

function getConstructor(page: Page) {
  return page.locator('section').filter({
    has: page.getByRole('button', { name: 'Оформить заказ' })
  });
}

function getOrderModal(page: Page) {
  return page.locator('#modals > div').filter({
    has: page.getByText('идентификатор заказа', { exact: true })
  });
}

function getIngredientModal(page: Page) {
  return page.locator('#modals > div').filter({
    has: page.getByRole('heading', { name: 'Ингредиенты' })
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

async function prepareAuthState(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'accessToken',
      value: mockAccessToken,
      url: 'http://localhost:4000'
    }
  ]);

  await context.addInitScript((refreshToken) => {
    localStorage.setItem('refreshToken', refreshToken);
  }, mockRefreshToken);
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
    await prepareAuthState(context);
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

    expect(
      await page.evaluate(() => localStorage.getItem('refreshToken'))
    ).toBe(mockRefreshToken);

    const cookies = await page.context().cookies('http://localhost:4000');
    expect(cookies.find((cookie) => cookie.name === 'accessToken')?.value).toBe(
      mockAccessToken
    );

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

    const orderModal = getOrderModal(page);

    await expect(
      orderModal.getByRole('heading', { name: mockOrderNumber })
    ).toBeVisible();
    await expect(
      orderModal.getByText('идентификатор заказа', { exact: true })
    ).toBeVisible();

    await expectEmptyConstructor(page);

    await orderModal.locator('button').click();

    await expect(orderModal).not.toBeVisible();
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
    await page.getByText(mockBunName).click();

    await expect(page).toHaveURL(new RegExp(`/ingredients/${mockBunId}$`));

    const ingredientModal = getIngredientModal(page);
    await expect(ingredientModal).toBeVisible();
    await expect(
      ingredientModal.getByRole('heading', { name: 'Ингредиенты' })
    ).toBeVisible();
    await expect(
      ingredientModal.getByRole('heading', { name: mockBunName })
    ).toBeVisible();

    const nutrition = ingredientModal.locator('ul');
    await expect(nutrition.getByText('420', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('80', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('24', { exact: true })).toBeVisible();
    await expect(nutrition.getByText('53', { exact: true })).toBeVisible();
  });

  test('Проверка - закрытие модального окна ингредиента по клику на крестик', async ({
    page
  }) => {
    await page.goto('/');
    await page.getByText(mockBunName).click();

    const ingredientModal = getIngredientModal(page);
    await expect(ingredientModal).toBeVisible();

    await ingredientModal.locator('button svg').click();

    await expect(ingredientModal).not.toBeVisible();
  });

  test('Проверка - закрытие модального окна ингредиента по клику на overlay', async ({
    page
  }) => {
    await page.goto('/');
    await page.getByText(mockBunName).click();

    const ingredientModal = getIngredientModal(page);
    await expect(ingredientModal).toBeVisible();

    const overlay = page.locator('#modals > div').last();
    await overlay.click({ position: { x: 10, y: 10 } });

    await expect(ingredientModal).not.toBeVisible();
  });
});
