import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { MapContext } from "../../context/map";
import {
	Chat,
	mapActiveContentToPinType,
	PinType,
} from "../../utils/mapSignalTypes";
import { ShowMapContext } from "../../context/show-map";
import { LocationMarkerIcon } from "@heroicons/react/solid";
import { ActiveContent } from "../../utils/types";
import Fuse from "fuse.js";
import { SearchIcon } from "@heroicons/react/outline";

export default function ListChats() {
	let navigate = useNavigate();
	const { setShowMap } = useContext(ShowMapContext);

	const { allSignals, setActiveContent, map } = useContext<{
		allSignals: Array<ActiveContent<Chat>>;
		setActiveContent: any;
		map: any;
	}>(MapContext as any);

	const [signals, setSignals] = useState<Array<ActiveContent<Chat>>>([]);
	const [contents, setContents] = useState("");

	useEffect(() => {
		setSignals(filtered_signals(allSignals));
	}, [allSignals]);

	const navigateToSignal = (signal: ActiveContent<Chat>) => {
		setActiveContent(signal);
		map.setView(signal.marker.getLatLng(), 13);
		setShowMap(true);
		navigate("/");
	};

	const filtered_signals = (signals: Array<ActiveContent<Chat>>) =>
		signals
			.concat()
			.filter(
				(signal) => mapActiveContentToPinType(signal) === PinType.Chat
			);

	const search = (searchPattern: string) => {
		setContents(searchPattern);
		if (searchPattern) {
			const fuse = new Fuse(filtered_signals(allSignals), {
				keys: [
					"id",
					"signalMetadata.metadata.contents",
					"signalMetadata.metadata.title",
					"signalMetadata.location.lat",
					"signalMetadata.location.long",
					"signalMetadata.username",
				],
			});

			const pattern = searchPattern;
			const searchResults = fuse.search(pattern);
			setSignals(searchResults.map((result) => result.item));
		} else {
			setSignals(filtered_signals(allSignals));
		}
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
							Chats
						</h3>
					</div>
					<div className="pl-10 pr-10">
						<div className=" min-w-0 flex-1 lg:px-0 ">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
								<div className="col-span-1">
									<label htmlFor="search" className="sr-only">
										Search
									</label>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
											<SearchIcon
												className="h-5 w-5 text-gray-400"
												aria-hidden="true"
											/>
										</div>
										<input
											id="signals-search"
											name="signals-search"
											className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
											placeholder="Search"
											type="signals-search"
											value={contents}
											onChange={(e) =>
												search(e.target.value)
											}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="p-10">
						<ul
							role="list"
							className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
						>
							{signals.map((signal) => (
								<li
									key={signal.signalMetadata?.id}
									className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200 border-solid border-2"
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
														?.metadata.contents
												}
											</p>
										</div>
									</div>
									<div>
										<div className="-mt-px flex divide-x divide-gray-200">
											<div className="-ml-px w-0 flex-1 flex">
												<button
													className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700  border border-transparent font-medium rounded-br-lg hover:text-gray-500"
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
