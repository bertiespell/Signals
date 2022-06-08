import { Principal } from "@dfinity/principal";
import { Marker } from "leaflet";
import React, { useContext, useEffect, useState } from "react";
import { rust_avenue } from "../../../declarations/rust_avenue";
import { SignalType_2 } from "../../../declarations/rust_avenue/rust_avenue.did";
import {
	EventSignal,
	mapSignalToType,
	mapSignalTypeToIcon,
	PinType,
	Trade,
	Chat,
	SignalType,
} from "../utils/mapSignalTypes";
import { UserContext } from "./user";

type MapContextType<T extends SignalType> = {
	pinType: PinType;
	activeContent: ActiveContent<T> | undefined;
	setPinType: any;
	sendSignal: any;
};

export const MapContext = React.createContext<MapContextType<SignalType>>(
	{} as any
);

const L = (window as any).L;

type Message = {
	contents: string;
	identity: string;
	time: string;
};

type Signal<T extends SignalType> = {
	created_at: string;
	updated_at: string;
	id: number;
	metadata: T;
	user: Principal;
	messages: Array<Message>;
	location: {
		lat: number;
		long: number;
	};
	signal_type: SignalType_2;
};

export type ActiveContent<T extends SignalType> = {
	marker: Marker;
	signalMetadata: Signal<T> | null;
	isNewPin: boolean;
};

const MapProvider = <T extends SignalType>({ children }: any) => {
	const { authenticatedActor } = useContext(UserContext);

	const [activeContent, setActiveContent] = useState<ActiveContent<T>>();

	const [mapInitialised, setMapInitialized] = useState(false);
	const [map, setMap] = useState();
	const [allMarkers, setAllMarkers] = useState<Array<Marker>>([]);

	const setKnownSignals = async () => {
		const signals: Array<Signal<any>> = await (
			rust_avenue as any
		).get_all_signals();

		signals.map((signal) => {
			console.log(signal);
			// when we reset data structure we can remove this try block
			try {
				let created_at_unix_timestamp = Number(
					signal.created_at
				).toString();

				// multiplied by 1000 so that the argument is in milliseconds, not seconds.
				const created_at = new Date(
					Number(created_at_unix_timestamp.slice(0, 10)) * 1000
				).toString();

				let updated_at_unix_timestamp = Number(
					signal.updated_at
				).toString();

				// multiplied by 1000 so that the argument is in milliseconds, not seconds.
				const updated_at = new Date(
					Number(updated_at_unix_timestamp.slice(0, 10)) * 1000
				).toString();

				const messages: Array<Message> = signal.messages.map(
					(message) => {
						let message_time = Number(message.time).toString();

						// multiplied by 1000 so that the argument is in milliseconds, not seconds.
						const time = new Date(
							Number(message_time.slice(0, 10)) * 1000
						).toString();
						console.log(message_time, time);
						return { ...message, time };
					}
				);

				const formattedSignal: Signal<T> = {
					...signal,
					created_at,
					updated_at,
					metadata: JSON.parse(signal.metadata),
				};

				var marker = L.marker(
					[signal.location.lat, signal.location.long],
					{
						icon: mapSignalTypeToIcon(L, signal.signal_type),
					}
				)
					.addTo(map)
					.on("click", () => {
						setActiveContent({
							marker,
							isNewPin: false,
							signalMetadata: formattedSignal,
						});
					});

				const newMarkers = allMarkers.concat();
				newMarkers.push(marker);
				setAllMarkers(newMarkers);
			} catch {}
		});
	};

	useEffect(() => {
		if (map) {
			setKnownSignals();
		}
	}, [map]);

	useEffect(() => {
		// get browser's current location
		window.navigator.geolocation.getCurrentPosition(
			(location) => {
				if (!mapInitialised) {
					setMapInitialized(true);
					// initialize the map to this view
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

					// create a marker in the center
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

	const sendSignal = async (
		e: Event,
		contents: EventSignal | Trade | Chat
	) => {
		e.preventDefault();
		if (activeContent && activeContent.isNewPin) {
			const location = activeContent?.marker.getLatLng();
			const signalType = mapSignalToType(pinType);
			try {
				const chat = await (authenticatedActor as any).create_new_chat(
					{ lat: location.lat, long: location.lng },
					JSON.stringify(contents),
					signalType
				);
				console.log(chat);
			} catch (e) {
				// The calls actually succeeds, but it returns an error:
				// Error: Fail to verify certificate
				// I think this may be a bug in local development setup though
				// (the call to the canister actually succeeds)
				// Some more detail here https://forum.dfinity.org/t/fail-to-verify-certificate-in-development-update-calls/4078
				console.log(e);
			}
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
