import { useEffect } from 'react';
import { ejectReducer, injectReducer } from '../app/store';

export default function useInjectReducer(key: string, reducer: (state: any, action: any) => any) {
	useEffect(() => {
		injectReducer(key, reducer);
	}, [key, reducer]);
	return () => {
		ejectReducer(key, false);
	};
}
