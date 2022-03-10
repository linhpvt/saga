import { configureStore, applyMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../features/root-reducer';
import httpReducer from '../app/http/http-slice'
import { httpWatcherSaga } from './http/http-saga';
// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  // @ts-ignore
  reducer: { ...rootReducer, http: httpReducer },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //   serializableCheck: false,
  //   thunk: false
  // }).concat(sagaMiddleware),
  enhancers: [applyMiddleware(sagaMiddleware)]
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStateType = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatchType = typeof store.dispatch;

export const dispatchToStore = store.dispatch;

// kick of root saga
sagaMiddleware.run(httpWatcherSaga);
