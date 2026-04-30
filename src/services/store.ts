import { configureStore } from '@reduxjs/toolkit';
import { constructorReducer } from './slices/constructorSlice';
import { ingredientsReducer } from './slices/ingredientsSlice';
import { feedReducer } from './slices/feedSlice';
import { orderDetailsReducer } from './slices/orderDetailsSlice';
import { userReducer } from './slices/userSlice';
import { profileOrdersReducer } from './slices/profileOrdersSlice';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

const rootReducer = {
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  feed: feedReducer,
  orderDetails: orderDetailsReducer,
  user: userReducer,
  profileOrders: profileOrdersReducer
};

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
