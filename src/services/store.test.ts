import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './store';

const expectedInitialState = {
  ingredients: {
    ingredients: [],
    isLoading: false,
    error: null
  },
  burgerConstructor: {
    constructorItems: {
      bun: null,
      ingredients: []
    },
    orderRequest: false,
    orderModalData: null
  },
  feed: {
    orders: [],
    total: 0,
    totalToday: 0,
    isLoading: false,
    error: null
  },
  orderDetails: {
    orderDetails: [],
    isLoading: false,
    error: null
  },
  user: {
    isAuthChecked: false,
    isAuthenticated: false,
    data: null,
    loginUserError: null,
    loginUserRequest: false,
    registerUserError: null,
    registerUserRequest: false,
    logoutUserError: null,
    logoutUserRequest: false,
    updateUserError: null,
    updateUserRequest: false
  },
  profileOrders: {
    orders: [],
    isLoading: false,
    error: null
  }
};

describe('Проверка rootReducer', () => {
  test('Проверка инициализации rootReducer', () => {
    const store = configureStore({ reducer: rootReducer });
    expect(store.getState()).toEqual(expectedInitialState);
  });
});
