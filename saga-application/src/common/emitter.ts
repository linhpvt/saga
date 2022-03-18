export const ApiEvents = {
	SUCCESS: 'http-success',
	FAILURE: 'http-failure',
};
export type HandlerFunc = (params: any) => void;
const Emitter = (() => {
	/* sample handers structure
  {
    click: HandlerFunc[],
    httpSuccess: HandlerFunc[],
    httpFailure: HandlerFunc[],
  }
  */
	const handlers: any = {};

	// publish data for handlers interesting with given `eventName`
	const publish = (eventName: string, data: any) => {
		(handlers[eventName] || []).forEach((handler: HandlerFunc) => handler(data));
		setInterval(() => console.log(handlers), 10 * 1000);
	};

	// subscribe to listen data for a given `eventName`
	const subscribe = (eventName: string, handler: HandlerFunc) => {
		let handlersByEventName = handlers[eventName];

		// not exist, create a new empty array
		if (!handlersByEventName) {
			handlers[eventName] = [];
			handlersByEventName = handlers[eventName];
		}

		handlersByEventName.push(handler);
		const index = handlersByEventName.length - 1;

		// unsubscribe function, called once we don't want to listen data any more
		return () => {
			handlers[eventName] = handlers[eventName].filter((_: any, i: number) => index !== i);
		};
	};
	return {
		publish,
		subscribe,
	};
})();
export default Emitter;
