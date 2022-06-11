import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { MapContext } from "../../context/map";
import {
	EventSignal,
	mapActiveContentToPinType,
	PinType,
} from "../../utils/mapSignalTypes";
import { ShowMapContext } from "../../context/show-map";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import { ActiveContent } from "../../utils/types";

export default function ListEvents() {
	let navigate = useNavigate();
	const { setShowMap } = useContext(ShowMapContext);
	const { allSignals, setActiveContent, map } = useContext<{
		allSignals: Array<ActiveContent<EventSignal>>;
		setActiveContent: any;
		map: any;
	}>(MapContext as any);

	const [signals, setSignals] = useState<Array<ActiveContent<EventSignal>>>(
		[]
	);

	useEffect(() => {
		const chat_signals = allSignals
			.concat()
			.filter(
				(signal) => mapActiveContentToPinType(signal) === PinType.Event
			);
		setSignals(chat_signals);
	}, [allSignals]);

	const navigateToSignal = (signal: ActiveContent<EventSignal>) => {
		setActiveContent(signal);
		map.setView(signal.marker.getLatLng(), 13);
		setShowMap(true);
		navigate("/");
	};

	return (
		<div className="flex-1 flex overflow-hidden w-max ">
			<div className="w-max min-w-0 flex-1 h-full flex flex-col overflow-y-auto lg:order-last ">
				<div className="p-10">
					<div className="p-10">
						<h2 className="text-base text-signalBlue-600 font-semibold tracking-wide uppercase">
							Create connections
						</h2>
						<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
							Events
						</h3>
					</div>
					<div>
						<ul
							role="list"
							className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
						>
							{signals.map((signal) => (
								<li
									key={signal.signalMetadata?.id}
									className="col-span-1 bg-signalBlue-1 rounded-lg shadow divide-y divide-gray-200"
								>
									<div className="w-full flex items-center justify-between p-6 space-x-6">
										<div className="flex-1 truncate">
											<div className="flex items-center space-x-3">
												<h3 className="text-gray-900 text-sm font-medium truncate">
													{
														signal.signalMetadata
															?.metadata.title
													}
												</h3>
											</div>
											<p className="mt-1 text-gray-500 text-sm truncate">
												{
													signal.signalMetadata
														?.metadata.description
												}
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												{
													signal.signalMetadata
														?.metadata.date
												}
											</p>
										</div>
									</div>
									<div>
										<div className="-mt-px flex divide-x divide-gray-200">
											<div className="-ml-px w-0 flex-1 flex">
												<button
													className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500"
													onClick={() =>
														navigateToSignal(signal)
													}
												>
													<LocationMarkerIcon
														className="w-5 h-5 text-gray-400"
														aria-hidden="true"
													/>
													<span className="ml-3">
														View Signal
													</span>
												</button>
											</div>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
