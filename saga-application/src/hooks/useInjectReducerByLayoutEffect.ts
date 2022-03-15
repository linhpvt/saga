/**
 * inject or eject reducers using useLayoutEffect hook to make it ready to use sooner than useEffect
 */
import { useLayoutEffect } from 'react';
import { ejectReducer, injectReducer } from '../app/store';

export default function useInjectReducer(key: string, reducer: (state: any, action: any) => any, removeSlice: boolean = false) {
	useLayoutEffect(() => {
		injectReducer(key, reducer);
	}, [key, reducer, removeSlice]);
	return () => {
		ejectReducer(key, removeSlice);
	};
}
