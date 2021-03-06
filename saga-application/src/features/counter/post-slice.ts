import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status } from '../../app/http/http-slice';
import { AppStateType } from '../../app/store';
import { Meta, HttpVerbs } from '../../app/http/http-saga';
import { HTTP_REQUEST, Method } from '../../app/global';
import { createGetAction } from '../../app/http/http-actions';

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
export const POST_FEATURE = 'postFeature';
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
			const { payload } = action;
			return { ...state, post: payload };
		},
		[`${ReqCommentsOfPost}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
			const { payload } = action;
			return { ...state, commentsOfPosts: payload };
		},
		[`${ReqPostAndComments}-${Status.SUCCESS}`]: (state, action: PayloadAction<any>) => {
			const { payload: [post, commentsByPostId] = [] } = action;
			return { ...state, post, commentsByPostId };
		},
	},
});

// action creators are generated for each case reducer function
export const getPostById = (id?: number) => {
	const meta: Meta = {
		apiUrl: id ? GET_ONE_POST : POSTS_API,
		urlParam: { id },
	};
	// @ts-ignore
	return createGetAction<any>(`${POST_FEATURE}/${ReqPosts}`, meta);
};

export const getCommentsOfAPost = (postId: number) => {
	const meta: Meta = { apiUrl: GET_COMMENTS_BY_POST, queryParam: { postId } };
	// @ts-ignore
	return createGetAction<any>(`${POST_FEATURE}/${ReqCommentsOfPost}`, meta);
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
	const { post: { value = 0 } = {} } = state || {};
	return value;
};

// reducer
export default counterSlice.reducer;
