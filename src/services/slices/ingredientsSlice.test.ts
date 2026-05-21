import { fetchIngredients, ingredientsReducer } from './ingredientsSlice';
import { TIngredient } from '../../utils/types';

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null
};

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png'
  }
];

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

  test('Провверка fetchIngredients.rejected: ошибка в сторе, isLoading = false', () => {
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
