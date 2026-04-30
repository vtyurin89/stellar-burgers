import {
  createAsyncThunk,
  createSlice,
  nanoid,
  PayloadAction
} from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TConstructorIngredient, TIngredient, TOrder } from '../../utils/types';

type TConstructorItems = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

type TConstructorState = {
  constructorItems: TConstructorItems;
  orderRequest: boolean;
  orderModalData: TOrder | null;
};

const initialState: TConstructorState = {
  constructorItems: {
    bun: null,
    ingredients: []
  },
  orderRequest: false,
  orderModalData: null
};

export const createOrder = createAsyncThunk<
  TOrder,
  void,
  { state: { burgerConstructor: TConstructorState } }
>('constructor/createOrder', async (_, { getState, rejectWithValue }) => {
  const { bun, ingredients } = getState().burgerConstructor.constructorItems;

  if (!bun) {
    return rejectWithValue('Булка не выбрана');
  }

  const ingredientIds = [
    bun._id,
    ...ingredients.map((item) => item._id),
    bun._id
  ];
  const response = await orderBurgerApi(ingredientIds);
  return {
    ...response.order,
    ingredients: ingredientIds
  };
});

const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    setBun: (state, action: PayloadAction<TIngredient>) => {
      state.constructorItems.bun = action.payload;
    },
    addIngredient: (state, action: PayloadAction<TIngredient>) => {
      state.constructorItems.ingredients.push({
        ...action.payload,
        id: nanoid()
      });
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.constructorItems.ingredients =
        state.constructorItems.ingredients.filter(
          (item) => item.id !== action.payload
        );
    },
    closeOrderModal: (state) => {
      state.orderModalData = null;
    },
    clearIngredients: (state) => {
      state.constructorItems.ingredients = [];
      state.constructorItems.bun = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state) => {
        state.orderRequest = false;
      });
  }
});

export const {
  setBun,
  addIngredient,
  removeIngredient,
  closeOrderModal,
  clearIngredients
} = constructorSlice.actions;
export const constructorReducer = constructorSlice.reducer;
