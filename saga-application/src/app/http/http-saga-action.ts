
/********************************************************************************
 * 
 * Recall api requests in case of failure with configured `MAX_RETRIES`
 * and delayed time for each call by utilizing the dispatch redux action.
 * 
 * There might be a lot of redundant operations occurs that might cause
 * the frontend performance issues 
 * 
 ********************************************************************************/

import {call, put, takeLatest, } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig } from 'axios';
import {dispatchToStore} from '../store';
import { failure, HttpState, pending, Status, success } from './http-slice';
import { Method, API_BASE_URL, MAX_RETRIES } from '../global';

const buildAxiosConfig = (): AxiosRequestConfig => {
  let token = Date.now();
  const cfg: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bear ${token}`,
    'Content-Type': 'application/json'
    }
  };
  return cfg;
}

const buildUrlWithParams = (url: string, urlParams: any) => {
  const keys = Object.keys(urlParams);
  keys.forEach((key: string) => {
    url = url.replace(`{${key}}`, urlParams[key])
  });
  return url;
}

const buildUrlWithQueries = (url: string, queryParams: any) => {
  const keys = Object.keys(queryParams);
  const queryString = keys.map((key: string) => (`${key}=${queryParams[key]}`)).concat('&');
  return `${url}?${queryString}`;
}

export interface Meta {
  apiUrl: string,       // api url: /posts/{accountId} | /posts
  urlParam?: object,    // { [key]: string | number | boolean }
  queryParam?: object,  // { [key]: string | number | boolean }
  method: string,       // post | put | get | delete
  retries?: number,     // number of retries until the request
  spinner?: boolean,    // show spinner indicator or not, default true
};

export function* httpWatcherSaga() {
  // @ts-ignore
  yield takeLatest<P, Meta>((action: PayloadAction<P, string, Meta>) => {
    const { meta: { apiUrl } = {}} = action;
    return apiUrl;
  }, httpWorkerSaga);
}

export function* httpWorkerSaga(action: { payload: any, type: string, meta: Meta }) {
  const {
    type,
    payload,
    payload: { id } = {},
    meta,
    meta: { retries = 0, method, queryParam, urlParam, apiUrl = '', spinner = true } = {}
  } = action;
  let actualUrlApi = urlParam ? buildUrlWithParams(apiUrl, urlParam): apiUrl;
  actualUrlApi = queryParam ? buildUrlWithQueries(actualUrlApi, queryParam): actualUrlApi;
  
  // spinner indicator
  if (spinner) {
    yield put(pending());
  }
  const config = buildAxiosConfig();
  let result;
  try {
    switch (method) {
      case Method.POST:
        // @ts-ignore
        result = yield call(axios.post, actualUrlApi, payload, config);
        break;
      case Method.GET:
        // @ts-ignore
        result = yield call(axios.get, actualUrlApi, config);
        break;
      case Method.PUT:
        // @ts-ignore
        result = yield call(axios.put, `${actualUrlApi}/${id}`, payload, config);
        break;
        case Method.DELETE:
          // @ts-ignore
          result = yield call(axios.delete, `${actualUrlApi}/${id}`, config);
          break;
      default:
        break;
    }
    const { data } = result;

    // TODO: end loading indicator
    if (spinner) {
      yield put(success());
    }
    // update data
    yield put({ type: `${type}-${Status.SUCCESS}`, payload: { result: data } });

  } catch (ex) {
    if (retries < MAX_RETRIES) {
      const retryAction = { ...action, meta: { ...meta, retries: retries + 1 }};
      // none blocking
      // yield put(retryAction)

      // async operation to ensure the worker terminated before dispatch Action.
      setTimeout(() => dispatchToStore(retryAction), 0);
    } else {
      // @ts-ignore
      const { message = '', response: { status = 500, statusText = '' } = {}
      } = ex;
      const payload: HttpState = {
        actionType: type,
        errorCode: 100,
        httpStatus: status,
        httpStatusText: statusText,
        message,
      }
      if (spinner) {
        yield put(failure(payload));
      }
    }
  }
}