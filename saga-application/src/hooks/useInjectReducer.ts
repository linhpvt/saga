import { useEffect } from 'react';
import { eject, inject } from '../app/store';

export default function useInjectReducer(key: string, reducer: (state: any, action: any) => any) {
	useEffect(() => {
		inject(key, reducer);
	}, [key, reducer]);
	return () => {
		eject(key);
	};
}
