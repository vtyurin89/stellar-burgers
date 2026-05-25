import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './store';

const combinedReducer = combineReducers(rootReducer);

const initAction = { type: 'UNKNOWN_ACTION' };

const getInitialRootState = () => combinedReducer(undefined, initAction);

describe('Проверка rootReducer', () => {
  test('Проверка инициализации rootReducer', () => {
    const store = configureStore({ reducer: rootReducer });
    expect(store.getState()).toEqual(getInitialRootState());
  });

  test('неизвестный экшен при undefined состоянии возвращает начальное состояние', () => {
    expect(combinedReducer(undefined, initAction)).toEqual(getInitialRootState());
  });
});
