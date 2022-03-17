import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import postReducer, {
	POST_FEATURE,
	decrement,
	increment,
	selectCount,
	incrementByAmount,
	requestPosts,
	getCommentsOfAPost,
	callMultipleApis,
} from './post-slice';
import { useDispatchAction } from '../../app/hook';
import { toNumber } from '../../helpers/datetime';

// import useInjectReducer from '../../hooks/useInjectReducer';
import useInjectReducer from '../../hooks/useInjectReducerByLayoutEffect';

export default function Counter() {
	useInjectReducer(POST_FEATURE, postReducer);

	const count = useSelector(selectCount);
	const dispatchAction = useDispatchAction();

	useEffect(() => {
		// single API call
		// dispatchAction(getCommentsOfAPost(1));

		// single API call
		dispatchAction(requestPosts(10));

		// concurrent API calls
		// dispatchAction(callMultipleApis(10, 1));
	}, [dispatchAction]);

	return (
		<div>
			<div>
				<button type="button" aria-label="Increment value" onClick={() => dispatchAction(increment())}>
					Increment
				</button>
				<span>{count}</span>
				<button type="button" aria-label="Decrement value" onClick={() => dispatchAction(decrement())}>
					Decrement
				</button>
				<button type="button" aria-label="Random" onClick={() => dispatchAction(incrementByAmount(toNumber(`${Math.random() * 10}`, 2)))}>
					Random 10
				</button>
			</div>
		</div>
	);
}
