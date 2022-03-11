import { useSelector } from 'react-redux'
import { decrement, increment, selectCount, incrementByAmount, requestPosts } from './counter-slice';
import { useDispatchAction } from '../../app/hook';
import { toNumber } from '../../helpers/datetime';
import { useEffect } from 'react';

export default function Counter() {
  const count = useSelector(selectCount);
  const dispatchAction = useDispatchAction();

  useEffect(() => {
    dispatchAction(requestPosts(10))
  }, [dispatchAction])

  return (
    <div>
      <div>
        <button
          aria-label="Increment value"
          onClick={() => dispatchAction(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatchAction(decrement())}
        >
          Decrement
        </button>
        <button
          aria-label="Decrement value"
          onClick={() => dispatchAction(incrementByAmount(toNumber(`${Math.random() * 10}`, 2)))}
        >
          Random 10
        </button>
      </div>
    </div>
  )
}