import { TOrder } from '@utils-types';
import { orderDetailsReducer, fetchOrder, initialState } from './orderDetailsSlice';

const mockOrderNumber = 12345;

const mockOrder: TOrder = {
  _id: '643d69a5c3f7b9001cfa0941',
  status: 'done',
  name: 'Биокотлета из марсианской Магнолии',
  createdAt: '2026-05-21T12:00:00.000Z',
  updatedAt: '2026-05-21T12:00:00.000Z',
  number: 123456,
  ingredients: ['643d69a5c3f7b9001cfa0941', '643d69a5c3f7b9001cfa0942']
};

describe('Проверка слайса orderDetailsSlice', () => {
  test('Проверка fetchOrder.pending: isLoading = true', () => {
    const result = orderDetailsReducer(
      initialState,
      fetchOrder.pending('requestId', mockOrderNumber)
    );

    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
    expect(result.orderDetails).toEqual([]);
  });

  test('Проверка fetchOrder.fulfilled: данные заказов в сторе, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };
    const mockOrderResponse = {
      success: true as const,
      orders: [mockOrder]
    };

    const result = orderDetailsReducer(
      loadingState,
      fetchOrder.fulfilled(mockOrderResponse, 'requestId', mockOrderNumber)
    );

    expect(result.isLoading).toBe(false);
    expect(result.orderDetails).toEqual([mockOrder]);
    expect(result.error).toBeNull();
  });

  test('Провверка fetchOrder.rejected: ошибка, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };
    const errorMessage = 'KERNEL_FETCH_ORDER_ERROR';

    const result = orderDetailsReducer(
      loadingState,
      fetchOrder.rejected(new Error(errorMessage), 'requestId', mockOrderNumber)
    );

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(errorMessage);
    expect(result.orderDetails).toEqual([]);
  });
});
