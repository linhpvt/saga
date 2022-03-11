import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Status } from '../../app/http/http-slice';
import { AppStateType } from '../../app/store';
import { Meta } from '../../app/http/http-saga';
import { HTTP_REQUEST, Method } from '../../app/global';
export interface CounterState {
  value: number,
  result: any[]
}
const initialState: CounterState = {
  value: 0,
  result: []
};
const user = {name: "linhpv", age: 10, remark: ""}
console.log('afdfdfdf')
// http action
const ReqPosts = `${HTTP_REQUEST}-Posts`;
// feature
const FEATURE = 'counter';
// api url
const POSTS_API = '/posts';
const GET_ONE_POIST = '/posts/{id}'

export const counterSlice = createSlice({
  name: FEATURE,
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
    [`${ReqPosts}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
      const { payload } = action;
      return { ...state, ...payload };
    },
  },
});

// action creators are generated for each case reducer function
export const requestPosts = (id?: number) => {
  const meta: Meta = {
    method: Method.GET,
    apiUrl: id ? GET_ONE_POIST: POSTS_API,
    urlParam: { id },
    // spinner: false
  };
  return { type: `${FEATURE}/${ReqPosts}`, payload: undefined, meta };
}
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// selectors
export const selectCount = (state: AppStateType) => state.counter.value;

// reducer
export default counterSlice.reducer;