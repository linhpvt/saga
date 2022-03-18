/** ******************************************************************************
 *
 * Recall api requests in case of failure with configured `MAX_RETRIES`****
 * and delayed time for each call at API Requesting level. ****************
 * Reduce the redundant operations by using dispatch action ***************
 *
 ******************************************************************************* */

import { call, put, all, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig } from 'axios';
import { failure, HttpState, pending, Status, success } from './http-slice';
import { Method, API_BASE_URL, MAX_RETRIES } from '../global';
import Emitter, { ApiEvents } from '../../common/emitter';

// time to delay for each retried call in millisecond
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

// build actual params for url, the placeholder must be in `{property}` format like {postId}
const buildUrlWithParams = (url: string, urlParams: any) => {
	const keys = Object.keys(urlParams);
	let actualUrl: string = url;
	keys.forEach((key: string) => {
		actualUrl = actualUrl.replace(`{${key}}`, urlParams[key]);
	});
	return actualUrl;
};
// queryParams: build the query string ro url, the placeholder must be in `{key: value}`
const buildUrlWithQueries = (url: string, queryParams: any) => {
	const keys = Object.keys(queryParams);
	const queryString = keys.map((key: string) => `${key}=${queryParams[key]}`).join('&');
	return `${url}?${queryString}`;
};
// Data type of concurrent  api call
export type RequestInfo = {
	httpVerb: string; // POST | PUT | GET | DELETE
	apiUrl: string; // api url: /posts/{accountId} | /posts
	urlParam?: object; // { [key]: string | number | boolean }
	queryParam?: object; // { [key]: string | number | boolean }
	payload?: object; // payload of POST | PUT
};

// the generic data structure for action.meta
export interface Meta {
	apiUrl?: string; // api url: /posts/{accountId} | /posts
	urlParam?: object; // { [key]: string | number | boolean }
	queryParam?: object; // { [key]: string | number | boolean }
	method?: string; // post | put | get | delete
	retries?: number; // number of retries until the request
	spinner?: boolean; // show spinner indicator or not, default true
	requestInfos?: RequestInfo[]; // contain promises to be executed just like Promise.all([...])
	id?: string | number; // record ID of PUT or DELETE
}
// control any exception
const EXCEPTION_CODE = -100;
// control success api call
const SUCCESS_CODE = 0;

// generic API response data
export interface ApiResponse {
	code: number;
	result: any;
}
// build response data structure
const buildResponse = (result: any, code: number = SUCCESS_CODE): ApiResponse => {
	return {
		code,
		result,
	} as ApiResponse;
};
export const doGet = async (
	url: string,
	payload: any,
	config: AxiosRequestConfig,
	retries: number = 0,
): Promise<ApiResponse> => {
	try {
		const { data } = await axios.get(url, config);
		return buildResponse(data);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doGet(url, payload, config, retries + 1);
		}
		return buildResponse(ex, EXCEPTION_CODE);
	}
};
export const doPost = async (
	url: string,
	payload: any,
	config: AxiosRequestConfig<any>,
	retries: number = 0,
): Promise<ApiResponse> => {
	try {
		const { data } = await axios.post(url, payload, config);
		return buildResponse(data);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doPost(url, config, payload, retries + 1);
		}
		return buildResponse(ex, EXCEPTION_CODE);
	}
};

export const doPut = async (
	url: string,
	payload: any,
	config: AxiosRequestConfig<any>,
	retries: number = 0,
): Promise<ApiResponse> => {
	try {
		const { data } = await axios.put(url, payload, config);
		return buildResponse(data);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doPut(url, config, payload, retries + 1);
		}
		return buildResponse(ex, EXCEPTION_CODE);
	}
};

export const doDelete = async (
	url: string,
	payload: any,
	config: AxiosRequestConfig<any>,
	retries: number = 0,
): Promise<ApiResponse> => {
	try {
		const { data } = await axios.delete(url, config);
		return buildResponse(data);
	} catch (ex) {
		if (retries < MAX_RETRIES) {
			await delay(DELAY_TIME);
			return doDelete(url, payload, config, retries + 1);
		}
		return buildResponse(ex, EXCEPTION_CODE);
	}
};

const ApisMap = {
	POST: doPost,
	PUT: doPut,
	GET: doGet,
	DELETE: doDelete,
};
export const HttpVerbs = {
	POST: 'POST',
	PUT: 'PUT',
	GET: 'GET',
	DELETE: 'DELETE',
};

export function* httpWatcherSaga() {
	// @ts-ignore
	yield takeLatest((action: PayloadAction<any, string, Meta>) => {
		const { meta: { apiUrl, method } = {} } = action;
		return apiUrl || method === Method.CONCURRENT;
	}, httpWorkerSaga);
}

export function* httpWorkerSaga(action: { payload: any; type: string; meta: Meta }) {
	const {
		type,
		payload,
		meta: { method, queryParam, urlParam, apiUrl = '', spinner = true, requestInfos = [] } = {},
	} = action;
	let realApiUrl = urlParam ? buildUrlWithParams(apiUrl, urlParam) : apiUrl;
	realApiUrl = queryParam ? buildUrlWithQueries(realApiUrl, queryParam) : realApiUrl;

	// spinner indicator
	if (spinner) {
		yield put(pending());
	}

	const config = buildAxiosConfig();
	// single call
	let resp: ApiResponse = { code: 0, result: null };
	// multiple calls
	let resps: ApiResponse[] = [];
	try {
		switch (method) {
			case Method.POST:
				resp = yield call(doPost, realApiUrl, payload, config);
				break;
			case Method.GET:
				resp = yield call(doGet, realApiUrl, undefined, config);
				break;
			case Method.PUT:
				resp = yield call(doPut, `${realApiUrl}`, payload, config);
				break;
			case Method.DELETE:
				resp = yield call(doDelete, `${realApiUrl}`, undefined, config);
				break;
			case Method.CONCURRENT: {
				resps = yield all(
					requestInfos.map((ri: RequestInfo) => {
						const { httpVerb: verb, apiUrl: url, payload: pl, queryParam: qp, urlParam: up } = ri;
						let actualUrl = up ? buildUrlWithParams(url, up) : url;
						actualUrl = qp ? buildUrlWithQueries(actualUrl, qp) : actualUrl;
						// @ts-ignore
						return call(ApisMap[verb], actualUrl, pl, config);
					}),
				);
				break;
			}
			default:
				break;
		}
		// convert the response of single call into array
		resps = method === Method.CONCURRENT ? resps : [resp];
		const errResults = resps.filter((res: ApiResponse) => res.code !== SUCCESS_CODE);
		const code = errResults.map((r: ApiResponse) => r.code)[0] || 0;

		// stop spinner
		if (spinner) {
			yield put(
				code === SUCCESS_CODE ? success() : failure(buildFailure(errResults[0].result, type)),
			);
		}

		// update store
		if (code === SUCCESS_CODE) {
			const successData = buildSuccessData(method, resps);
			yield put({
				type: `${type}-${Status.SUCCESS}`,
				payload: successData,
			});
			// success event
			Emitter.publish(ApiEvents.SUCCESS, { data: successData, action });
		} else {
			// failure event
			Emitter.publish(ApiEvents.FAILURE, {
				action,
				data: buildFailureData(method, resps, type),
			});
		}
	} catch (ex: any) {
		const plFailure = buildFailure(ex, type);
		if (spinner) {
			yield put(failure(plFailure));
		}
		Emitter.publish(ApiEvents.FAILURE, { data: plFailure, action });
	}
}

// build a single failed object
const buildFailure = (ex: any, type: string) => {
	const { message = '', response: { status = 500, statusText = '' } = {} } = ex;
	const failureAction: HttpState = {
		actionType: type,
		errorCode: 100,
		httpStatus: status,
		httpStatusText: statusText,
		message,
	};
	return failureAction;
};

// build failed data object for emitter
const buildFailureData = (method: string | undefined, resps: ApiResponse[], type: string) => {
	return method === Method.CONCURRENT
		? resps
				.filter((r: ApiResponse) => r.code === EXCEPTION_CODE)
				.map((r: ApiResponse) => buildFailure(r.result, type))
		: buildFailure(resps[0].result, type);
};

// build success data object for emitter
const buildSuccessData = (method: string | undefined, resps: ApiResponse[]) => {
	return method === Method.CONCURRENT
		? resps.filter((r: ApiResponse) => r.code === SUCCESS_CODE).map((r: ApiResponse) => r.result)
		: resps[0].result;
};
