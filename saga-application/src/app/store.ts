import { configureStore, applyMiddleware, combineReducers } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import httpReducer from './http/http-slice';
import rootSaga from './http/root-saga';

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const staticReducers = {
	http: httpReducer,
};
/* *******************************************************************************
************ inject | eject reducers dynamically ******************************

const ReducersAggregation = (() => {
	const dynamicReducers = {};
	const ejectReducer = (key: string, removeSlice: boolean = false): void => {
		const keys = Object.keys(dynamicReducers);
		// existed -> eject
		if (keys.includes(key)) {
			// @ts-ignore
			delete dynamicReducers[key];

			// clean up data slice
			delete store.getState()[key];

			// @ts-ignore
			store.replaceReducer(combineReducers({ ...staticReducers, ...dynamicReducers }));
		}
	};
	const injectReducer = (key: string, reducer: (state: any, action: any) => any): void => {
		const keys = Object.keys(dynamicReducers);
		if (keys.includes(key)) {
			console.error(`Reducer with Key: ${key} existed`);
			return;
		}
		// append key: reducer to dynamic reducers
		// @ts-ignore
		dynamicReducers[key] = reducer;
		// @ts-ignore
		store.replaceReducer(combineReducers({ ...staticReducers, ...dynamicReducers }));
	};
	return {
		injectReducer,
		ejectReducer,
	};
})();

// export const { injectReducer, ejectReducer } = ReducersAggregation;

******************************************************************** */

/**
 * Another way to implement eject | inject reducers dynamically.
 */
const ReducerManager = ((initialReducers) => {
	const currentReducers = { ...initialReducers };
	let aggregatedReducers = combineReducers(currentReducers);

	const injectReducer = (key: string, reducer: (state: any, action: any) => any) => {
		const keys = Object.keys(currentReducers);
		if (keys.includes(key)) {
			// eslint-disable-next-line
			console.error(`Reducer with Key: ${key} existed`);
			return;
		}
		// @ts-ignore
		currentReducers[key] = reducer;
		//  combine reducers again
		aggregatedReducers = combineReducers(currentReducers);
	};
	const ejectReducer = (key: string, removeSlice: boolean = false) => {
		const keys = Object.keys(currentReducers);
		if (keys.includes(key)) {
			// @ts-ignore
			delete currentReducers[key];
			// combine reducer again
			aggregatedReducers = combineReducers(currentReducers);
		}
		// clean up slice data
		if (removeSlice) {
			delete store.getState()[key];
		}
	};
	const reduce = (state: any, action: any): any => {
		return aggregatedReducers(state, action);
	};

	return {
		injectReducer,
		ejectReducer,
		reduce,
	};
})(staticReducers);

export const { injectReducer, ejectReducer } = ReducerManager;

export const store = configureStore({
	// @ts-ignore
	// reducer: (state: any, action: any) => {
	// 	console.log('state, action', state, action);
	// },
	reducer: ReducerManager.reduce,
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
