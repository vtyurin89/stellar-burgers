import {
  addIngredient,
  removeIngredient,
  moveIngredient,
  initialState,
  constructorReducer
} from './constructorSlice';

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

const mockWithThreeIngredients = [
  {
    id: '1',
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
  },
  {
    id: '2',
    _id: '643d69a5c3f7b9001cfa0945',
    name: 'Соус с шипами Антарианского плоскоходца',
    type: 'sauce',
    proteins: 101,
    fat: 99,
    carbohydrates: 100,
    calories: 100,
    price: 88,
    image: 'https://code.s3.yandex.net/react/code/sauce-01.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-01-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-01-large.png'
  },
  {
    id: '3',
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'main',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png'
  }
];

describe('проверка слайса constructorSlice и его редьюсеров', () => {
    test('Проверка экшена добавления ингредиента', () => {
        const result = constructorReducer(initialState, addIngredient(additionalIngredient));

        expect(result.constructorItems.bun).toBeNull();
        expect(result.constructorItems.ingredients).toHaveLength(1);
        expect(result.constructorItems.ingredients[0]).toMatchObject(additionalIngredient);
    });

    test('removeIngredient удаляет ингредиент по id', () => {
    const result = constructorReducer(
        {
        ...initialState,
        constructorItems: { bun: null, ingredients: mockWithOneIngredient }
        },
        removeIngredient('4815162342')
    );
    expect(result.constructorItems.ingredients).toEqual([]);
    });
    
    test('removeIngredient не меняет список при несуществующем id', () => {
    const result = constructorReducer(
        {
        ...initialState,
        constructorItems: { bun: null, ingredients: mockWithOneIngredient }
        },
        removeIngredient('1313')
    );
    expect(result.constructorItems.ingredients).toEqual(mockWithOneIngredient);
    });

  test('moveIngredient меняет порядок ингредиентов в начинке', () => {
    const stateWithIngredients = {
      ...initialState,
      constructorItems: {
        bun: null,
        ingredients: [...mockWithThreeIngredients]
      }
    };

    const result = constructorReducer(
      stateWithIngredients,
      moveIngredient({ from: 2, to: 0 })
    );

    expect(result.constructorItems.ingredients.map((item) => item.id)).toEqual([
      '3',
      '1',
      '2'
    ]);
  });
});
