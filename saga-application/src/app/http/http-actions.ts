import { PayloadAction } from '@reduxjs/toolkit';
import { Method } from 'app/global';
import { Meta } from './http-saga-by-verbs';

export function createPostAction<P>(type: string, payload: P, meta: Meta): PayloadAction<P, string, Meta> {
	const httpAction: PayloadAction<any, string, Meta> = {
		type,
		payload,
		meta: {
			...meta,
			method: Method.POST,
		},
	};
	return httpAction;
}

export function createPutAction<P>(type: string, id: string | number, payload: P, meta: Meta): PayloadAction<P, string, Meta> {
	const httpAction: PayloadAction<any, string, Meta> = {
		type,
		payload,
		meta: {
			...meta,
			id,
			method: Method.PUT,
		},
	};
	return httpAction;
}

export function createGetAction<P>(type: string, meta: Meta): PayloadAction<P, string, Meta> {
	return {
		type,
		meta: {
			...meta,
			method: Method.GET,
		},
	} as PayloadAction<any, string, Meta>;
}

export function createDeleteAction<P>(type: string, meta: Meta): PayloadAction<P, string, Meta> {
	return {
		type,
		meta: {
			...meta,
			method: Method.GET,
		},
	} as PayloadAction<any, string, Meta>;
}
