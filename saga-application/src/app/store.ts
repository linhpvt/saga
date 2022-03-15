import { configureStore, applyMiddleware, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from '../features/root-reducer';
import httpReducer from './http/http-slice';
import rootSaga from './http/root-saga';

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const staticReducers = {
	http: httpReducer,
};

export const store = configureStore({
	// @ts-ignore
	reducer: { http: httpReducer },
	// middleware: (getDefaultMiddleware) => getDefaultMiddleware({
	//   serializableCheck: false,
	//   thunk: false
	// }).concat(sagaMiddleware),
	enhancers: [applyMiddleware(sagaMiddleware)],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type AppStateType = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatchType = typeof store.dispatch;

export const dispatchToStore = store.dispatch;

// kick of root saga
// sagaMiddleware.run(httpWatcherSaga);
sagaMiddleware.run(rootSaga);

// inject | eject reducers
const o = (() => {
	const dynamicReducers = {};
	const eject = (key: string): void => {
		const keys = Object.keys(dynamicReducers);
		// existed -> eject
		if (keys.includes(key)) {
			// @ts-ignore
			delete dynamicReducers[key];
			// @ts-ignore
			store.replaceReducer(combineReducers(...staticReducers, ...dynamicReducers));
		}
	};
	const inject = (key: string, reducer: (state: any, action: any) => any): void => {
		const keys = Object.keys(dynamicReducers);
		if (keys.indexOf(key)) {
			console.error(`Reducer with Key: ${key} existed`);
			return;
		}
		// append key: reducer to dynamic reducers
		// @ts-ignore
		dynamicReducers[key] = reducer;
		// @ts-ignore
		store.replaceReducer(combineReducers(...staticReducers, ...dynamicReducers));
	};
	return {
		inject,
		eject,
	};
})();

export const { inject, eject } = o;
