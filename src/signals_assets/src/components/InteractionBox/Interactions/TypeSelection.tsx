import { PinType } from "../../../utils/mapSignalTypes";

export default function TypeSelection({
	selectType,
}: {
	selectType: (type: PinType) => void;
}) {
	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<h3 className="mt-2 text-xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				Choose Signal Type
			</h3>
			<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					Signals can be left for a variety of uses. Perhaps you just
					want to leave a message somewhere for someone to find. Or
					you could leave a signal about an event taking place, or an
					item for sale.
				</p>
				<p className="text-lg text-gray-500">
					Select the signal type that best fits your message:
				</p>
			</div>
			<div className="flex flex-col justify-center items-center p-2">
				<button
					type="button"
					className="w-1/2 m-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white  bg-signalBlue-200 hover:bg-signalBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-manatee"
					onClick={() => selectType(PinType.Chat)}
				>
					<div className="flex-shrink-0 flex items-center px-4">
						<img
							className="h-8 w-auto"
							src="../../event-two.png"
							alt="Workflow"
						/>
					</div>
					Chat
				</button>
				<button
					type="button"
					className="w-1/2 m-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-signalBlue-200 hover:bg-signalBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signalBlue-200"
					onClick={() => selectType(PinType.Trade)}
				>
					<div className="flex-shrink-0 flex items-center px-4">
						<img
							className="h-8 w-auto"
							src="../../basket.png"
							alt="Workflow"
						/>
					</div>
					Trade
				</button>
				<button
					type="button"
					className=" w-1/2 m-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white  bg-signalBlue-200 hover:bg-signalBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signalBlue-200"
					onClick={() => selectType(PinType.Event)}
				>
					<div className="flex-shrink-0 flex items-center px-4">
						<img
							className="h-8 w-auto"
							src="../../chat-five.png"
							alt="Workflow"
						/>
					</div>
					Event
				</button>
			</div>
		</div>
	);
}
