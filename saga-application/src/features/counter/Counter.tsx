import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { decrement, increment, selectCount, incrementByAmount, requestPosts, getCommentsOfAPost } from './counter-slice';
import { useDispatchAction } from '../../app/hook';
import { toNumber } from '../../helpers/datetime';

export default function Counter() {
	const count = useSelector(selectCount);
	const dispatchAction = useDispatchAction();

	useEffect(() => {
		dispatchAction(requestPosts(10));
		dispatchAction(getCommentsOfAPost(1));
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
				<button type="button" aria-label="Decrement value" onClick={() => dispatchAction(incrementByAmount(toNumber(`${Math.random() * 10}`, 2)))}>
					Random 10
				</button>
			</div>
		</div>
	);
}
