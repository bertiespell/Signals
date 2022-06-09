import { useNavigate } from "react-router-dom";

import { MailOpenIcon } from "@heroicons/react/outline";
import { useContext, useEffect, useState } from "react";
import { ActiveContent, MapContext } from "../../context/map";
import {
	Chat,
	mapActiveContentToPinType,
	PinType,
} from "../../utils/mapSignalTypes";
import { ShowMapContext } from "../../context/show-map";

export default function ListChats() {
	let navigate = useNavigate();
	const { setShowMap } = useContext(ShowMapContext);

	const { allSignals, setActiveContent, map } = useContext<{
		allSignals: Array<ActiveContent<Chat>>;
		setActiveContent: any;
		map: any;
	}>(MapContext as any);

	const [signals, setSignals] = useState<Array<ActiveContent<Chat>>>([]);

	const navigateToSignal = (signal: ActiveContent<Chat>) => {
		setActiveContent(signal);
		map.setView(signal.marker.getLatLng(), 13);
		setShowMap(true);
		navigate("/");
	};

	useEffect(() => {
		const chat_signals = allSignals
			.concat()
			.filter(
				(signal) => mapActiveContentToPinType(signal) === PinType.Chat
			);
		setSignals(chat_signals);
	}, [allSignals]);

	return (
		<div className="flex-1 flex overflow-hidden">
			<h1>Chats</h1>
			<ul
				role="list"
				className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
			>
				{signals.map((signal) => (
					<li
						key={signal.signalMetadata?.id}
						className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
					>
						<div className="w-full flex items-center justify-between p-6 space-x-6">
							<div className="flex-1 truncate">
								<div className="flex items-center space-x-3">
									<h3 className="text-gray-900 text-sm font-medium truncate">
										{signal.signalMetadata?.metadata.title}
									</h3>
								</div>
								<p className="mt-1 text-gray-500 text-sm truncate">
									{signal.signalMetadata?.metadata.contents}
								</p>
							</div>
						</div>
						<div>
							<div className="-mt-px flex divide-x divide-gray-200">
								<div className="-ml-px w-0 flex-1 flex">
									<button
										className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
										onClick={() => navigateToSignal(signal)}
									>
										<MailOpenIcon
											className="w-5 h-5 text-gray-400"
											aria-hidden="true"
										/>
										<span className="ml-3">Message</span>
									</button>
								</div>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
