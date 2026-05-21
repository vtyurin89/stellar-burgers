import { profileOrdersReducer, getProfileOrders, initialState } from './profileOrdersSlice';
import { TOrder } from '@utils-types';

const mockOrder: TOrder = {
  _id: '643d69a5c3f7b9001cfa0941',
  status: 'done',
  name: 'Биокотлета из марсианской Магнолии',
  createdAt: '2026-05-21T12:00:00.000Z',
  updatedAt: '2026-05-21T12:00:00.000Z',
  number: 123456,
  ingredients: ['643d69a5c3f7b9001cfa0941', '643d69a5c3f7b9001cfa0942']
};

describe('Проверка слайса profileOrdersSlice', () => {
  test('Проверка getProfileOrders.pending: isLoading = true', () => {
    const result = profileOrdersReducer(
      initialState,
      getProfileOrders.pending('requestId')
    );

    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
    expect(result.orders).toEqual([]);
  });

  test('Проверка getProfileOrders.fulfilled: данные заказов в сторе, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };

    const result = profileOrdersReducer(
      loadingState,
      getProfileOrders.fulfilled([mockOrder], 'requestId')
    );

    expect(result.isLoading).toBe(false);
    expect(result.orders).toEqual([mockOrder]);
    expect(result.error).toBeNull();
  });

  test('Проверка getProfileOrders.rejected: ошибка, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };
    const errorMessage = 'KERNEL_PROFILE_ORDERS_ERROR!!!!!';

    const result = profileOrdersReducer(
      loadingState,
      getProfileOrders.rejected(new Error(errorMessage), 'requestId')
    );

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(errorMessage);
    expect(result.orders).toEqual([]);
  });
});
