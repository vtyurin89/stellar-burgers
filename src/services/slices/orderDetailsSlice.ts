import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

type TOrderDetailsState = {
  orderDetails: TOrder[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TOrderDetailsState = {
  orderDetails: [],
  isLoading: false,
  error: null
};

export const fetchOrder = createAsyncThunk(
  'orderDetails/fetchOrder',
  getOrderByNumberApi
);

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.orders;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.error.message ?? 'Не удалось загрузить данные заказа!';
      });
  }
});

export const orderDetailsReducer = orderDetailsSlice.reducer;
