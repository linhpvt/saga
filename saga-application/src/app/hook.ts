import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { AppDispatchType, AppStateType } from './store'
import { useCallback } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatchType>()
export const useAppSelector: TypedUseSelectorHook<AppStateType> = useSelector;
export const useDispatchAction = () => { 
  const dispatch = useDispatch<AppDispatchType>();
  return useCallback(function<P, M, E>(action: PayloadAction<P, string> | PayloadAction<P, string, M, E>) {
    dispatch(action);
  }, [dispatch])
}