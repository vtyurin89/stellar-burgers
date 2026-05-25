import { feedReducer, fetchFeed, initialState } from './feedSlice';
import { TOrder } from '../../utils/types';

const mockOrders: TOrder[] = [{
  _id: '643d69a5c3f7b9001cfa0941',
  status: 'done',
  name: 'Биокотлета из марсианской Магнолии',
  createdAt: '2026-05-21T12:00:00.000Z',
  updatedAt: '2026-05-21T12:00:00.000Z',
  number: 123456,
  ingredients: ['643d69a5c3f7b9001cfa0941', '643d69a5c3f7b9001cfa0942']
}];


describe('Проверка слайса feedSlice', () => {
  test('Проверка fetchFeed.pending: isLoading = true', () => {
    const result = feedReducer(
      initialState,
      fetchFeed.pending('requestId')
    );

    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  test('Проверка fetchFeed.fulfilled: заказы в списке, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };

    const mockFeedResponse = {
      success: true,
      orders: mockOrders,
      total: 100,
      totalToday: 5
    };

    const result = feedReducer(
      loadingState,
      fetchFeed.fulfilled(mockFeedResponse, 'requestId')
    );

    expect(result.isLoading).toBe(false);
    expect(result.orders).toEqual(mockOrders);
    expect(result.total).toBe(100);
    expect(result.totalToday).toBe(5);
    expect(result.error).toBeNull();
  });

  test('Провверка fetchFeed.rejected: ошибка, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };
    const errorMessage = 'KERNEL_FEED_ERROR!!!';

    const result = feedReducer(
      loadingState,
      fetchFeed.rejected(new Error(errorMessage), 'requestId')
    );

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(errorMessage);
    expect(result.orders).toEqual([]);
  });
});
