import { CalendarIcon, ChatIcon, MailIcon } from "@heroicons/react/outline";
import { PinType } from "../../context/new-pin";

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
			<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					Signals can be left for a variety of uses. Perhaps you just
					want to leave a message somewhere for someone to find.
				</p>
				<p className="text-lg text-gray-500">
					Or you could leave an expiring signal about an event taking
					place.
				</p>
				<p className="text-lg text-gray-500">
					You might also be selling something in an area, for which
					you can leave a signal. Later we'll provide a richer
					experience to interact with signals, which will support
					things like purchases and ticketing.
				</p>
				<p className="text-lg text-gray-500">
					Select the signal type that best fits your message:
				</p>
			</div>
			<div className="flex flex-col justify-center items-center p-5">
				<button
					type="button"
					className="w-1/3 m-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-manatee hover:bg-manatee focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-manatee"
					onClick={() => selectType(PinType.Chat)}
				>
					<ChatIcon
						className="-ml-1 mr-3 h-5 w-5"
						aria-hidden="true"
					/>
					Chat
				</button>
				<button
					type="button"
					className="w-1/3 m-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					onClick={() => selectType(PinType.Trade)}
				>
					<MailIcon
						className="-ml-1 mr-3 h-5 w-5"
						aria-hidden="true"
					/>
					Trade
				</button>
				<button
					type="button"
					className=" w-1/3 m-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
					onClick={() => selectType(PinType.Event)}
				>
					<CalendarIcon
						className="-ml-1 mr-3 h-5 w-5"
						aria-hidden="true"
					/>
					Event
				</button>
			</div>
		</div>
	);
}
