import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppStateType } from '../../app/store';

export interface CounterState {
  value: number
}
const initialState: CounterState = {
  value: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      let { value } = state;
      value++;
      return { ...state, value };
    },
    decrement: (state) => {
      let { value } = state;
      value--;
      return { ...state, value };
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      const { payload } = action;
      const { value } = state;
      return { ...state, value: value + payload };
    },
  },
})

// Action creators are generated for each case reducer function
export const { increment,
  decrement,
  incrementByAmount,
} = counterSlice.actions;

// selectors
export const selectCount = (state: AppStateType) => state.counter.value;

// reducer
export default counterSlice.reducer