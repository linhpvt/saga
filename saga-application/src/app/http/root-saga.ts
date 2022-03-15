import { all } from 'redux-saga/effects';
import rootVerbs from './http-saga-by-verbs';
import { httpWatcherSaga } from './http-saga';

export default function* rootSaga() {
	yield all([
		httpWatcherSaga(),
		// rootVerbs()
	]);
}
