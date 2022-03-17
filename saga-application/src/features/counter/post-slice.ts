import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '../../app/http/http-slice';
import { AppStateType } from '../../app/store';
import { Meta, HttpVerbs } from '../../app/http/http-saga';
import { HTTP_REQUEST, Method } from '../../app/global';

export interface PostState {
	value: number;
	posts: any[];
	commentsOfPosts: any[];
	post: object;
	commentsByPostId: any[];
}
const initialState: PostState = {
	value: 0,
	posts: [],
	commentsOfPosts: [],
	post: {},
	commentsByPostId: [],
};
// http action
const ReqPosts = `${HTTP_REQUEST}-Posts`;
const ReqCommentsOfPost = `${HTTP_REQUEST}-CommentsOfPost`;
const ReqPostAndComments = `${HTTP_REQUEST}-PostAndComment`;
// feature
export const POST_FEATURE = 'post';
// api url
const POSTS_API = '/posts';
const GET_ONE_POST = '/posts/{id}';
const GET_COMMENTS_BY_POST = '/comments';

export const counterSlice = createSlice({
	name: POST_FEATURE,
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
			const { payload: { result } = {} } = action;
			return { ...state, posts: result };
		},
		[`${ReqCommentsOfPost}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
			const { payload: { result } = {} } = action;
			return { ...state, commentsOfPosts: result };
		},
		[`${ReqPostAndComments}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
			const { payload: { result: [post, commentsByPostId] = {} } = {} } = action;
			return { ...state, post, commentsByPostId };
		},
	},
});

// action creators are generated for each case reducer function
export const requestPosts = (id?: number) => {
	const meta: Meta = {
		method: Method.GET,
		apiUrl: id ? GET_ONE_POST : POSTS_API,
		urlParam: { id },
		// spinner: false
	};
	return { type: `${POST_FEATURE}/${ReqPosts}`, payload: undefined, meta };
};

export const getCommentsOfAPost = (postId: number) => {
	const meta: Meta = { method: Method.GET, apiUrl: GET_COMMENTS_BY_POST, queryParam: { postId } };
	return { type: `${POST_FEATURE}/${ReqCommentsOfPost}`, payload: undefined, meta };
};
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export const callMultipleApis = (postId: number | string, refPostId: number | string) => {
	const meta: Meta = {
		method: Method.CONCURRENT,
		requestInfos: [
			{ httpVerb: HttpVerbs.GET, apiUrl: GET_ONE_POST, urlParam: { id: postId } },
			{
				httpVerb: HttpVerbs.GET,
				apiUrl: GET_COMMENTS_BY_POST,
				queryParam: { postId: refPostId },
			},
		],
	};
	return { type: `${POST_FEATURE}/${ReqPostAndComments}`, payload: undefined, meta };
	// doGet, actualUrlApi, config
};

// selectors
export const selectCount = (state: AppStateType) => {
	// @ts-ignore
	const { counter: { value = 0 } = {} } = state || {};
	return value;
};

// reducer
export default counterSlice.reducer;
