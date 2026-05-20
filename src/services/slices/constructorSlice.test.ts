import { addIngredient, removeIngredient, initialState, constructorReducer } from './constructorSlice';

const additionalIngredient = {
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
};

const mockWithOneIngredient = [
  {
    id: '4815162342',
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

describe('проверка слайса constructorSlice и его редьюсеров', () => {
    test('Проверка экшена добавления ингредиента', () => {
        const result = constructorReducer(initialState, addIngredient(additionalIngredient));

        expect(result.constructorItems.bun).toBeNull();
        expect(result.constructorItems.ingredients).toHaveLength(1);
        expect(result.constructorItems.ingredients[0]).toMatchObject(additionalIngredient);
    });

    test('Проверка экшена удаления ингредиента', () => {
        const mockID = '4815162342';
        const result = constructorReducer({
            ...initialState,
            constructorItems: {
                bun: null,
                ingredients: mockWithOneIngredient
            },
        }, removeIngredient(mockID));

        expect(result.constructorItems.bun).toBeNull();
        expect(result.constructorItems.ingredients).toEqual([]);
    });
});
