import { useContext, useEffect } from "react";
import { ActiveContent, MapContext } from "../context/map";
import Map from "../Map";
import {
	mapActiveContentToPinType,
	PinType,
	SignalType,
} from "../utils/mapSignalTypes";
import InteractionBox from "./InteractionBox";
import Chat from "./signals/chat";
import Event from "./signals/event";
import Trade from "./signals/trade";

export default function LayoutPanels() {
	const { activeContent } = useContext(MapContext);

	const mapContentTypeToPanel = (
		activeContent?: ActiveContent<SignalType>
	) => {
		if (activeContent?.signalMetadata?.signal_type) {
			const signalType = mapActiveContentToPinType(activeContent);
			if (signalType === PinType.Chat)
				return (
					<>
						<Chat></Chat>
					</>
				);
			if (signalType === PinType.Trade)
				return (
					<>
						<Trade></Trade>
					</>
				);
			if (signalType === PinType.Event)
				return (
					<>
						<Event></Event>
					</>
				);
		}
	};

	return (
		<>
			{/* Primary column */}
			<section
				aria-labelledby="primary-heading"
				className="min-w-0 flex-1 h-full flex flex-col overflow-y-auto lg:order-last"
			>
				<h1 id="primary-heading" className="sr-only">
					Account
				</h1>
				<div>
					<Map />
				</div>
			</section>

			{/* Secondary column (hidden on smaller screens) */}
			<aside className="hidden lg:block lg:flex-shrink-0 lg:order-first">
				<div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white overflow-y-auto grid-cols-1 grid-rows-8">
					{activeContent?.isNewPin ? (
						<InteractionBox />
					) : (
						<>{mapContentTypeToPanel(activeContent)}</>
					)}
				</div>
			</aside>
		</>
	);
}
