import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '../../app/http/http-slice';
import { AppStateType } from '../../app/store';
import { Meta } from '../../app/http/http-saga';
import { HTTP_REQUEST, Method } from '../../app/global';

export interface CounterState {
	value: number;
	posts: any[];
	commentsOfPosts: any[];
}
const initialState: CounterState = {
	value: 0,
	posts: [],
	commentsOfPosts: [],
};
// http action
const ReqPosts = `${HTTP_REQUEST}-Posts`;
const ReqCommentsOfPost = `${HTTP_REQUEST}-CommentsOfPost`;
// feature
const FEATURE = 'counter';
// api url
const POSTS_API = '/posts';
const GET_ONE_POIST = '/posts/{id}';
const GET_COMMENTS_BY_POST = '/comments';

export const counterSlice = createSlice({
	name: FEATURE,
	initialState,
	reducers: {
		increment: (state) => {
			let { value } = state;
			value += 1;
			return { ...state, value };
		},
		decrement: (state) => {
			let { value } = state;
			value -= 1;
			return { ...state, value };
		},
		incrementByAmount: (state, action: PayloadAction<number>) => {
			const { payload } = action;
			const { value } = state;
			return { ...state, value: value + payload };
		},
		[`${ReqPosts}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
			const { payload } = action;
			return { ...state, posts: payload };
		},
		[`${ReqCommentsOfPost}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
			const { payload } = action;
			return { ...state, commentsOfPosts: payload };
		},
	},
});

// action creators are generated for each case reducer function
export const requestPosts = (id?: number) => {
	const meta: Meta = {
		method: Method.GET,
		apiUrl: id ? GET_ONE_POIST : POSTS_API,
		urlParam: { id },
		// spinner: false
	};
	return { type: `${FEATURE}/${ReqPosts}`, payload: undefined, meta };
};

export const getCommentsOfAPost = (postId: number) => {
	const meta: Meta = { method: Method.GET, apiUrl: GET_COMMENTS_BY_POST, queryParam: { postId } };
	return { type: `${FEATURE}/${ReqCommentsOfPost}`, payload: undefined, meta };
};
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// selectors
export const selectCount = (state: AppStateType) => state.counter.value;

// reducer
export default counterSlice.reducer;
