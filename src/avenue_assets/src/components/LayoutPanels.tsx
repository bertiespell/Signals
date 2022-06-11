import { useContext, useEffect, useState } from "react";
import { MapContext } from "../context/map";
import { ShowMapContext } from "../context/show-map";
import Map from "../Map";

import InteractionBox from "./InteractionBox";

import { useLocation } from "react-router-dom";
import SignalContainer from "./signals/signal-container";

export default function LayoutPanels() {
	const location = useLocation();
	const { activeContent } = useContext(MapContext);
	const { showMap } = useContext(ShowMapContext);

	const [visibility, setVisibility] = useState("visible");

	useEffect(() => {
		if (location.pathname !== "/") {
			setVisibility("hidden");
		} else {
			const visibility = showMap ? "" : "hidden";
			setVisibility(visibility);
		}
	}, [showMap, location]);

	return (
		<>
			<section
				aria-labelledby="primary-heading"
				className={`min-w-0 flex-1 h-full flex-col ${visibility}`}
			>
				<Map />
			</section>

			<aside
				className={`hidden lg:block lg:flex-shrink-0 lg:order-first ${visibility}`}
			>
				<div
					className={`h-full relative flex flex-col w-96 bg-white overflow-y-auto grid-cols-1 grid-rows-8 ${visibility}`}
				>
					{activeContent?.isNewPin ? (
						<InteractionBox />
					) : (
						<>
							<SignalContainer />
						</>
					)}
				</div>
			</aside>
		</>
	);
}
