import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppStateType } from '../../app/store';

export const Status = {
  IDLE: 'Idle',
  PENDING: 'Pending',
  SUCCESS: 'Success',
  FAILURE: 'Failure'
}
export interface HttpState {
  errorCode?: number,  // error code
  httpStatus?: number, // http status code
  httpStatusText?: string, // http status text 
  errors?: any[], // list of error from backend
  status?: string // idle | pending | success | failure
  actionType?: string,
  message?: string
}
const initialState: HttpState = {
  errorCode: 0,
  httpStatus: 200,
  httpStatusText: '',
  errors: [],
  status: Status.IDLE,
  actionType: '',
  message: ''
}

export const httpSlice = createSlice({
  name: 'http',
  initialState,
  reducers: {
    idle: (state) => {
      return {...state, ...initialState}
    },
    pending: (state) => {
      return { ...state, ...initialState, status: Status.PENDING }
    },
    success: (state) => {
      return { ...state, ...initialState, status: Status.SUCCESS };
    },
    failure: (state, action ) => {
      return { ...state, ...action.payload, status: Status.FAILURE }
    }
  },
})

// Action creators are generated for each case reducer function
export const { idle,
  pending,
  success,
  failure
} = httpSlice.actions;

// selectors
export const selectHttp = (state: AppStateType) => state.http;

// reducer
export default httpSlice.reducer