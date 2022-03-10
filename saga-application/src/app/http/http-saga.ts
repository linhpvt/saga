
/********************************************************************************
 * 
 * Recall api requests in case of failure with configured `MAX_RETRIES`****
 * and delayed time for each call at API Requesting level. ****************
 * Reduce the redundant operations by using dispatch action *************** 
 * 
 ********************************************************************************/

import {call, put, takeLatest, } from 'redux-saga/effects'
import { PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { failure, HttpState, pending, Status, success } from './http-slice';
import { Method, API_BASE_URL, MAX_RETRIES } from '../global';

const delay = (milliseconds: number) => new Promise((resolve: Function) => {
  setTimeout(() => resolve(), milliseconds);
});

const buildAxiosConfig = (): AxiosRequestConfig => {
  let token = Date.now();
  const cfg: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bear ${token}`,
      token,
    'Content-Type': 'application/json'
    }
  };
  return cfg;
}

const buildUrlWithParams = (url: string, urlParams: any) => {
  const keys = Object.keys(urlParams);
  let actualUrl: string = url;
  keys.forEach((key: string) => {
    actualUrl = actualUrl.replace(`{${key}}`, urlParams[key])
  });
  return actualUrl;
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

const doGet = async (url: string, config: AxiosRequestConfig, retries: number = 0): Promise<AxiosResponse<any,any>> => {
  console.log('RETRIES: ', retries)
  try {
    return await axios.get(url, config);
  } catch (ex) {
    if (retries < MAX_RETRIES) {
      await delay(4000);
      return doGet(url, config, retries + 1);
    } else {
      throw ex;
    }
  }
}
const doPost = async (url: string, payload: any, config: AxiosRequestConfig<any>, retries: number = 0): Promise<AxiosResponse<any,any>> => {
  try {
    return await axios.post(url, payload, config);
  } catch (ex) {
    if (retries < MAX_RETRIES) {
      await delay(4000);
      return doPost(url, config, payload, retries + 1);
    } else {
      throw ex;
    }
  }
}
const doPut = async (url: string, payload: any, config: AxiosRequestConfig<any>, retries: number = 0): Promise<AxiosResponse<any, any>> => {
  try {
    return await axios.put(url, payload, config);
  } catch (ex) {
    if (retries < MAX_RETRIES) {
      await delay(4000);
      return doPut(url, config, payload, retries + 1);
    } else {
      throw ex;
    }
  }
}
const doDelete = async (url: string, config: AxiosRequestConfig<any>, retries: number = 0): Promise<AxiosResponse<any, any>> => {
  try {
    return await axios.delete(url, config)
  } catch (ex) {
    if (retries < MAX_RETRIES) {
      await delay(4000);
      return doDelete(url, config, retries + 1);
    } else {
      throw ex;
    }
  }
}

export function* httpWatcherSaga() {
  // @ts-ignore
  yield takeLatest<P, Meta>((action: PayloadAction<P, string, Meta>) => {
    console.log('Http watcher handles request !!!, ', action);
    const { meta: { apiUrl } = {}} = action;
    return apiUrl;
  }, httpWorkerSaga);
}

export function* httpWorkerSaga(action: { payload: any, type: string, meta: Meta }) {
  const {
    type,
    payload,
    payload: { id } = {},
    meta: { method, queryParam, urlParam, apiUrl = '', spinner = true } = {}
  } = action;
  let actualUrlApi = urlParam ? buildUrlWithParams(apiUrl, urlParam): apiUrl;
  actualUrlApi = queryParam ? buildUrlWithQueries(actualUrlApi, queryParam): actualUrlApi;
  
  // spinner indicator
  // @ts-ignore
  spinner && (yield put(pending()));
  
  const config = buildAxiosConfig();
  let result;
  try {
    switch (method) {
      case Method.POST:
        // @ts-ignore
        result = yield call(doPost, actualUrlApi, payload, config);
        break;
      case Method.GET:
        // @ts-ignore
        result = yield call(doGet, actualUrlApi, config);
        break;
      case Method.PUT:
        // @ts-ignore
        result = yield call(doPut, `${actualUrlApi}/${id}`, payload, config);
        break;
        case Method.DELETE:
          // @ts-ignore
          result = yield call(doDelete, `${actualUrlApi}/${id}`, config);
          break;
      default:
        break;
    }
    const { data } = result;
    // @ts-ignore
    spinner && (yield put(success()));
    // update data
    yield put({ type: `${type}-${Status.SUCCESS}`, payload: { result: data } });

  } catch (ex) {
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
    // @ts-ignore
    spinner && (yield put(failure(payload)));
  }
}