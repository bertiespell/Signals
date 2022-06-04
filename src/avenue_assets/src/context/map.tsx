import { Marker } from "leaflet";
import React, { useContext, useEffect, useState } from "react";
import { rust_avenue } from "../../../declarations/rust_avenue";
import { SignalType_2 } from "../../../declarations/rust_avenue/rust_avenue.did";
import {
	mapSignalToType,
	mapSignalTypeToIcon,
	PinType,
} from "../utils/mapSignalTypes";

export const MapContext = React.createContext<{
	// marker: Marker | undefined;
	pinType: PinType;
	activeContent: ActiveContent | undefined;
	setPinType: any;
	sendSignal: any;
}>({} as any);

const L = (window as any).L;

type Signal = {
	location: {
		lat: number;
		long: number;
	};
	signal: {
		messages: Array<{
			contents: string;
			identity: string;
			time: string;
		}>;
		signal_type: SignalType_2;
	};
};

export type ActiveContent = {
	marker: Marker;
	signalMetadata: Signal | null;
	isNewPin: boolean;
};

const MapProvider = ({ children }: any) => {
	const [activeContent, setActiveContent] = useState<ActiveContent>();

	const [mapInitialised, setMapInitialized] = useState(false);
	const [map, setMap] = useState();
	const [allMarkers, setAllMarkers] = useState<Array<Marker>>([]);

	const setKnownSignals = async () => {
		const signals: Array<Signal> = await (
			rust_avenue as any
		).get_all_signals();

		signals.map((signal) => {
			var marker = L.marker([signal.location.lat, signal.location.long], {
				icon: mapSignalTypeToIcon(L, signal.signal.signal_type),
			})
				.addTo(map)
				.on("click", () => {
					setActiveContent({
						marker,
						isNewPin: false,
						signalMetadata: signal,
					});
				});
			const newMarkers = allMarkers.concat();
			newMarkers.push(marker);
			setAllMarkers(newMarkers);
		});
	};

	useEffect(() => {
		if (map) {
			setKnownSignals();
		}
	}, [map]);

	useEffect(() => {
		window.navigator.geolocation.getCurrentPosition(
			(location) => {
				if (!mapInitialised) {
					setMapInitialized(true);
					var map = L.map("map").setView(
						[location.coords.latitude, location.coords.longitude],
						13
					);
					setMap(map);

					L.tileLayer(
						"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
						{
							maxZoom: 19,
							attribution: "© OpenStreetMap",
						}
					).addTo(map);

					var marker = L.marker(
						[location.coords.latitude, location.coords.longitude],
						{
							draggable: true,
							icon: L.icon({
								iconUrl:
									"https://unpkg.com/leaflet@1.0.3/dist/images/marker-icon.png",
								className: "blinking",
								iconSize: [37, 58],
							}),
						}
					)
						.addTo(map)
						.on("click", () =>
							setActiveContent({
								marker,
								isNewPin: true,
								signalMetadata: null,
							})
						);
					setActiveContent({
						marker,
						isNewPin: true,
						signalMetadata: null,
					});
				}
			},
			(error) => {
				console.log("error", error);
			}
		);
	});

	const [pinType, setPinType] = useState(PinType.Chat);

	const sendSignal = async (e: Event, initial_message: string) => {
		e.preventDefault();
		if (activeContent && activeContent.isNewPin) {
			const location = activeContent?.marker.getLatLng();
			const coveretedSignalType = mapSignalToType(pinType);
			const chat = await rust_avenue.create_new_chat(
				{ lat: location.lat, long: location.lng },
				initial_message,
				coveretedSignalType
			);
			return;
		}
		throw Error("No new signal detected");
	};

	return (
		<MapContext.Provider
			value={{
				activeContent,
				pinType,
				setPinType,
				sendSignal,
			}}
		>
			{children}
		</MapContext.Provider>
	);
};

export default MapProvider;
