import { PayloadAction } from '@reduxjs/toolkit';
import { Method } from 'app/global';
import { Meta } from './http-saga-by-verbs';

export const createPostAction = (type: string, payload: any, meta: Meta): PayloadAction<any, string, Meta> => {
	const httpAction: PayloadAction<any, string, Meta> = {
		type,
		payload,
		meta: {
			...meta,
			method: Method.POST,
		},
	};
	return httpAction;
};

export const createPutAction = (type: string, id: string | number, payload: any, meta: Meta): PayloadAction<any, string, Meta> => {
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
};

export const createGetAction = (type: string, meta: Meta): PayloadAction<any, string, Meta> => {
	return {
		type,
		meta: {
			...meta,
			method: Method.GET,
		},
	} as PayloadAction<any, string, Meta>;
};

export const createDeleteAction = (type: string, meta: Meta): PayloadAction<any, string, Meta> => {
	return {
		type,
		meta: {
			...meta,
			method: Method.GET,
		},
	} as PayloadAction<any, string, Meta>;
};
