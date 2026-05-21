import { fetchIngredients, ingredientsReducer } from './ingredientsSlice';
import { TIngredient } from '../../utils/types';
import mockIngredientsData from '../../mocks/ingredients.json';

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null
};

const mockIngredients = mockIngredientsData as TIngredient[];

describe('Проверка слайса ingredientsSlice', () => {
  test('Проверка fetchIngredients.pending: isLoading = true', () => {
    const result = ingredientsReducer(
      initialState,
      fetchIngredients.pending('requestId')
    );

    expect(result.isLoading).toBe(true);
    expect(result.error).toBeNull();
  });

  test('Проверка fetchIngredients.fulfilled: ингредиенты в сторе, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };

    const result = ingredientsReducer(
      loadingState,
      fetchIngredients.fulfilled(mockIngredients, 'requestId')
    );

    expect(result.isLoading).toBe(false);
    expect(result.ingredients).toEqual(mockIngredients);
    expect(result.error).toBeNull();
  });

  test('Проверка fetchIngredients.rejected: ошибка в сторе, isLoading = false', () => {
    const loadingState = { ...initialState, isLoading: true };
    const errorMessage = 'KERNEL_INGREDIENTS_ERROR';

    const result = ingredientsReducer(
      loadingState,
      fetchIngredients.rejected(new Error(errorMessage), 'requestId')
    );

    expect(result.isLoading).toBe(false);
    expect(result.error).toBe(errorMessage);
    expect(result.ingredients).toEqual([]);
  });
});
