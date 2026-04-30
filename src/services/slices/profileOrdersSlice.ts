import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getOrdersApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

type TProfileOrdersState = {
  orders: TOrder[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TProfileOrdersState = {
  orders: [],
  isLoading: false,
  error: null
};

export const getProfileOrders = createAsyncThunk(
  'profileOrders/fetchOrders',
  getOrdersApi
);

const profileOrdersSlice = createSlice({
  name: 'profileOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfileOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfileOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getProfileOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ??
          'Не удалось загрузить заказы данного профиля!';
      });
  }
});

export const profileOrdersReducer = profileOrdersSlice.reducer;
