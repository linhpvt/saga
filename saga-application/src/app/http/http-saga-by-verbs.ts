/** ******************************************************************************
 *
 * Recall api requests in case of failure with configured `MAX_RETRIES`****
 * and delayed time for each call at API Requesting level. ****************
 * Reduce the redundant operations by using dispatch action ***************
 *
 ******************************************************************************* */

import { all, call, put, takeEvery } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { failure, HttpState, pending, Status, success } from './http-slice';
import { Method, API_BASE_URL, MAX_RETRIES } from '../global';

const DELAY_TIME = 50;
const delay = (milliseconds: number) =>
	new Promise((resolve: any) => {
		setTimeout(() => resolve(), milliseconds);
	});

const buildAxiosConfig = (): AxiosRequestConfig => {
	const token = Date.now();
	const cfg: AxiosRequestConfig = {
		baseURL: API_BASE_URL,
		headers: {
			Authorization: `Bear ${token}`,
			token,
			'Content-Type': 'application/json',
		},
	};
	return cfg;
};

const buildUrlWithParams = (url: string, urlParams: any) => {
	const keys = Object.keys(urlParams);
	let actualUrl: string = url;
	keys.forEach((key: string) => {
		actualUrl = actualUrl.replace(`{${key}}`, urlParams[key]);
	});
	return actualUrl;
};

const buildUrlWithQueries = (url: string, queryParams: any) => {
	const keys = Object.keys(queryParams);
	const queryString = keys.map((key: string) => `${key}=${queryParams[key]}`).join('&');
	return `${url}?${queryString}`;
};

export interface Meta {
	apiUrl: string; // api url: /posts/{accountId} | /posts
	urlParam?: object; // { [key]: string | number | boolean }
	queryParam?: object; // { [key]: string | number | boolean }
	method: string; // post | put | get | delete
	retries?: number; // number of retries until the request
	spinner?: boolean; // show spinner indicator or not, default true
	id?: number | string; // id of record to delete | update
}

const doGet = async (url: string, config: AxiosRequestConfig, retries: number = 0): Promise<AxiosResponse<any, any>> => {
	try {
		return await axios.get(url, config);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doGet(url, config, retries + 1);
		}
		throw ex;
	}
};
const doPost = async (url: string, payload: any, config: AxiosRequestConfig<any>, retries: number = 0): Promise<AxiosResponse<any, any>> => {
	try {
		return await axios.post(url, payload, config);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doPost(url, config, payload, retries + 1);
		}
		throw ex;
	}
};
const doPut = async (url: string, payload: any, config: AxiosRequestConfig<any>, retries: number = 0): Promise<AxiosResponse<any, any>> => {
	try {
		return await axios.put(url, payload, config);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doPut(url, config, payload, retries + 1);
		}
		throw ex;
	}
};
const doDelete = async (url: string, config: AxiosRequestConfig<any>, retries: number = 0): Promise<AxiosResponse<any, any>> => {
	try {
		return await axios.delete(url, config);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doDelete(url, config, retries + 1);
		}
		throw ex;
	}
};

function* onError(ex: any, type: string, spinner: boolean) {
	const { message = '', response: { status = 500, statusText = '' } = {} } = ex;
	const failureAction: HttpState = {
		actionType: type,
		errorCode: 100,
		httpStatus: status,
		httpStatusText: statusText,
		message,
	};
	if (spinner) {
		yield put(failure(failureAction));
	}
}
export function* httpPostWatcherSaga() {
	// @ts-ignore
	yield takeEvery((action: PayloadAction<any, string, Meta>) => {
		const { meta: { method } = {} } = action;
		return method === Method.POST;
	}, httpPostWorkerSaga);
}

export function* httpPostWorkerSaga(action: { payload: any; type: string; meta: Meta }) {
	const { type, payload, meta: { queryParam, urlParam, apiUrl = '', spinner = true } = {} } = action;
	let actualUrlApi = urlParam ? buildUrlWithParams(apiUrl, urlParam) : apiUrl;
	actualUrlApi = queryParam ? buildUrlWithQueries(actualUrlApi, queryParam) : actualUrlApi;
	// spinner indicator
	if (spinner) {
		yield put(pending());
	}
	const config = buildAxiosConfig();
	try {
		// @ts-ignore
		const result = yield call(doPost, actualUrlApi, payload, config);
		const { data } = result || {};
		if (spinner) {
			yield put(success());
		}
		// update data
		yield put({ type: `${type}-${Status.SUCCESS}`, payload: { result: data } });
	} catch (ex: any) {
		// @ts-ignore
		yield* onError(ex, type, spinner);
	}
}

export function* httpPutWatcherSaga() {
	// @ts-ignore
	yield takeEvery((action: PayloadAction<any, string, Meta>) => {
		const { meta: { method } = {} } = action;
		return method === Method.PUT;
	}, httpPutWorkerSaga);
}

export function* httpPutWorkerSaga(action: { payload: any; type: string; meta: Meta }) {
	const { type, payload, meta: { queryParam, urlParam, apiUrl = '', spinner = true, id } = {} } = action;
	let actualUrlApi = urlParam ? buildUrlWithParams(apiUrl, urlParam) : apiUrl;
	actualUrlApi = queryParam ? buildUrlWithQueries(actualUrlApi, queryParam) : actualUrlApi;

	// spinner indicator
	if (spinner) {
		yield put(pending());
	}

	const config = buildAxiosConfig();
	try {
		// @ts-ignore
		const result = yield call(doPut, `${actualUrlApi}/${id}`, payload, config);
		const { data } = result || {};
		if (spinner) {
			yield put(success());
		}
		// update data
		yield put({ type: `${type}-${Status.SUCCESS}`, payload: { result: data } });
	} catch (ex: any) {
		// @ts-ignore
		yield* onError(ex, type, spinner);
	}
}

export function* httpGetWatcherSaga() {
	// @ts-ignore
	yield takeEvery((action: PayloadAction<any, string, Meta>) => {
		const { meta: { method } = {} } = action;
		return method === Method.GET;
	}, httpGetWorkerSaga);
}

export function* httpGetWorkerSaga(action: { payload: any; type: string; meta: Meta }) {
	const { type, payload: { id } = {}, meta: { queryParam, urlParam, apiUrl = '', spinner = true } = {} } = action;
	let actualUrlApi = urlParam ? buildUrlWithParams(apiUrl, urlParam) : apiUrl;
	actualUrlApi = queryParam ? buildUrlWithQueries(actualUrlApi, queryParam) : actualUrlApi;

	// spinner indicator
	if (spinner) {
		yield put(pending());
	}

	const config = buildAxiosConfig();
	try {
		// @ts-ignore
		const result = yield call(doGet, actualUrlApi, config);
		const { data } = result || {};
		if (spinner) {
			yield put(success());
		}
		// update data
		yield put({ type: `${type}-${Status.SUCCESS}`, payload: { result: data } });
	} catch (ex: any) {
		// @ts-ignore
		yield* onError(ex, type, spinner);
	}
}

export function* httpDeleteWatcherSaga() {
	// @ts-ignore
	yield takeEvery((action: PayloadAction<any, string, Meta>) => {
		const { meta: { method } = {} } = action;
		return method === Method.DELETE;
	}, httpDeleteWorkerSaga);
}

export function* httpDeleteWorkerSaga(action: { payload: any; type: string; meta: Meta }) {
	const { type, meta: { id, queryParam, urlParam, apiUrl = '', spinner = true } = {} } = action;
	let actualUrlApi = urlParam ? buildUrlWithParams(apiUrl, urlParam) : apiUrl;
	actualUrlApi = queryParam ? buildUrlWithQueries(actualUrlApi, queryParam) : actualUrlApi;

	// spinner indicator
	if (spinner) {
		yield put(pending());
	}
	const config = buildAxiosConfig();
	try {
		// @ts-ignore
		const result = yield call(doDelete, id ? `${actualUrlApi}/${id}` : `${actualUrlApi}`, config);
		const { data } = result || {};
		if (spinner) {
			yield put(success());
		}
		// update data
		yield put({ type: `${type}-${Status.SUCCESS}`, payload: { result: data } });
	} catch (ex: any) {
		// @ts-ignore
		yield* onError(ex, type, spinner);
	}
}

export default function* rootVerbs() {
	yield all([httpPostWatcherSaga(), httpPutWatcherSaga(), httpGetWatcherSaga(), httpDeleteWatcherSaga()]);
}
