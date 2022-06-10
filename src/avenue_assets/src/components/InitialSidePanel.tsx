export default function Starting({}: {}) {
	const login = () => {
		console.log("todo");
	};

	const createSignal = () => {
		console.log("todo");
	};
	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
				Create connections
			</h2>
			<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				Leave a Signal
			</h3>
			<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					Welcome to Signals. A unique SocialFi space for making local
					connections, creating decentralized communities and
					discovering events.
				</p>
				<p className="text-lg text-gray-500">
					Signals encourages real world personal interactions,
					allowing users to broadcast signals into their environment.
				</p>
				<p className="text-lg text-gray-500">
					Signals is a DAO. The more you interact with the network,
					the greater say you have in how it's governed. Signals is a
					rich multi-purpose platform, you can learn more about how
					Signals works here.
				</p>
				<p className="text-lg text-gray-500">
					You can explore signals in view mode, but the app works best
					when you're logged in with you're internet identity. **ADD
					QMARK**. You should also enable your location to see Signals
					left in your area.
				</p>
			</div>
			<div className="mt-10 row-span-3">
				<button
					type="button"
					className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					onClick={createSignal}
				>
					Create Signal
				</button>
				<button
					type="button"
					className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					onClick={login}
				>
					Create Signal
				</button>
			</div>
		</div>
	);
}