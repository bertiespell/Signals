import { ActorSubclass } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { Marker } from "leaflet";
import React, { useContext, useEffect, useState } from "react";
import { rust_avenue } from "../../../declarations/rust_avenue";
import {
	SignalType_2,
	_SERVICE,
} from "../../../declarations/rust_avenue/rust_avenue.did";
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
import { v4 as uuidv4 } from "uuid";

type MapContextType<T extends SignalType> = {
	pinType: PinType;
	activeContent: ActiveContent<T> | undefined;
	newPinContent: ActiveContent<T> | undefined;
	setActiveContent: any;
	setPinType: any;
	sendSignal: any;
	allSignals: Array<ActiveContent<T>>;
	map: any;
	sendMessage: any;
	createNewActivePin: any;
	setRefReady: any;
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
	id: string;
	marker: Marker;
	signalMetadata: Signal<T> | null;
	isNewPin: boolean;
};

const defaultLocation = {
	coords: {
		latitude: 51.508039,
		longitude: -0.128069,
	},
	timestamp: Date.now(),
};

const MapProvider = <T extends SignalType>({ children }: any) => {
	const { authenticatedActor, authenticatedUser } = useContext(UserContext);

	const [activeContent, setActiveContent] = useState<ActiveContent<T>>();

	const [mapInitialised, setMapInitialized] = useState(false);
	const [map, setMap] = useState();
	const [allMarkers, setAllMarkers] = useState<Array<Marker>>([]);
	const [allSignals, setAllSignals] = useState<Array<ActiveContent<T>>>([]);

	const [newPinContent, setNewPinContent] = useState<ActiveContent<T>>();
	const [refReady, setRefAsReady] = useState(false);

	const setRefReady = () => {
		setRefAsReady(true);
	};

	useEffect(() => {
		if (!mapInitialised && refReady) {
			setMapInitialized(true);
			const location = defaultLocation;

			var map = L.map("map").setView(
				[location.coords.latitude, location.coords.longitude],
				13
			);
			setMap(map);
			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
			}).addTo(map);
			map.attributionControl.setPrefix("");
			addNewPin(location as any, map);
		}
	}, [refReady]);

	const sendMessage = async (
		activeContent: ActiveContent<T>,
		message: string
	) => {
		const updateActiveContent = () => {
			const new_content = Object.create(activeContent);

			new_content?.signalMetadata?.messages.push({
				contents: message,
				identity: (authenticatedUser as any).toString(),
				time: new Date(Number(Date.now()) * 1000).toString(),
			});
			setActiveContent(new_content);
		};
		if (activeContent?.signalMetadata && authenticatedActor) {
			try {
				await (
					authenticatedActor as unknown as ActorSubclass<_SERVICE>
				).add_new_message(
					activeContent?.signalMetadata?.location,
					message
				);
				updateActiveContent();
			} catch (e: any) {
				try {
					if (
						// this is a known bug in local dev that this error throws incorrectly
						(e as Error).message.includes(
							"Fail to verify certificate"
						)
					) {
						updateActiveContent();
					}
				} catch {}
			}
		}
	};

	const transformSignal = (signal: Signal<any>) => {
		// when we reset data structure we can remove this try block

		let created_at_unix_timestamp = Number(signal.created_at).toString();

		// multiplied by 1000 so that the argument is in milliseconds, not seconds.
		const created_at = new Date(
			Number(created_at_unix_timestamp.slice(0, 10)) * 1000
		).toString();

		let updated_at_unix_timestamp = Number(signal.updated_at).toString();

		// multiplied by 1000 so that the argument is in milliseconds, not seconds.
		const updated_at = new Date(
			Number(updated_at_unix_timestamp.slice(0, 10)) * 1000
		).toString();

		const messages: Array<Message> = signal.messages.map((message) => {
			let message_time = Number(message.time).toString();

			// multiplied by 1000 so that the argument is in milliseconds, not seconds.
			const time = new Date(
				Number(message_time.slice(0, 10)) * 1000
			).toString();
			return { ...message, time };
		});

		const formattedSignal: Signal<T> = {
			...signal,
			created_at,
			updated_at,
			metadata: JSON.parse(signal.metadata),
			messages,
		};

		const activeContent = {
			id: uuidv4(),
			marker,
			isNewPin: false,
			signalMetadata: formattedSignal,
		};

		var marker = L.marker([signal.location.lat, signal.location.long], {
			icon: mapSignalTypeToIcon(L, signal.signal_type),
		})
			.addTo(map)
			.on("click", () => {
				if (map) (map as any).setView(marker.getLatLng(), 13);

				setActiveContent(activeContent);
			});
		const newMarkers = allMarkers.concat();
		newMarkers.push(marker);
		setAllMarkers(newMarkers);
		activeContent.marker = marker;
		return activeContent;
	};

	const setKnownSignals = async () => {
		const signals: Array<Signal<any>> = await (
			rust_avenue as any
		).get_all_signals();

		let allSignals: Array<ActiveContent<T>> = [];
		signals.map((signal) => {
			const activeContent = transformSignal(signal);
			allSignals.push(activeContent);
		});
		setAllSignals(allSignals);
	};

	useEffect(() => {
		if (map) {
			setKnownSignals();
		}
	}, [map]);

	const createNewActivePin = () => {
		if (!allSignals.find((signal) => signal.isNewPin === true)) {
			const location = (map as any).getCenter();
			addNewPin(
				{
					coords: {
						latitude: location.lat,
						longitude: location.lng,
					},
				} as GeolocationPosition,
				map
			);
		}
	};

	const addNewPin = (location: GeolocationPosition, map: any) => {
		const active = {
			id: uuidv4(),
			marker: null,
			isNewPin: true,
			signalMetadata: null,
		};

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
			.on("click", () => {
				(map as any).setView(marker.getLatLng(), 13);
				setActiveContent({
					...active,
					marker,
				});
			})
			.on("drag", () => {
				setActiveContent({
					...active,
					marker,
				});
			});
		active.marker = marker;
		setActiveContent(active as any);
		setNewPinContent(active as any);
	};

	const setLocation = (location: GeolocationPosition, map: any) => {
		if (refReady && map) {
			if (!mapInitialised && refReady && map) {
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
					}
				).addTo(map);
				map.attributionControl.setPrefix("");
				addNewPin(location, map);
			} else {
				map.setView(
					[location.coords.latitude, location.coords.longitude],
					13
				);
				deleteActiveContent();

				addNewPin(location, map);
			}
		}
	};

	const deleteActiveContent = () => {
		if (activeContent) {
			activeContent.isNewPin = false;
			if (map) {
				(map as any).removeLayer(activeContent?.marker);
			}
		}
	};

	const getLocationWithMap = async () => {
		if (map) {
			const curried = (location: any) => {
				setLocation(location, map);
			};

			await window.navigator.geolocation.getCurrentPosition(curried);
		}
	};

	useEffect(() => {
		getLocationWithMap();
	}, [refReady, mapInitialised, map]);

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
				const signal: Signal<any> = await (
					authenticatedActor as any
				)?.create_new_chat(
					{ lat: location.lat, long: location.lng },
					JSON.stringify(contents),
					signalType
				);

				// remove the newsignal marker
				activeContent.isNewPin = false;
				activeContent.marker.remove();
				setNewPinContent(undefined);

				// add it to known signals
				let newAllSignals: Array<ActiveContent<T>> =
					allSignals.concat();
				const newActiveContent = transformSignal(signal);
				newAllSignals.push(newActiveContent);

				setAllSignals(newAllSignals);
				setActiveContent(newActiveContent);
				(map as any).setView(newActiveContent.marker.getLatLng(), 13);

				newActiveContent.isNewPin = false;
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
				newPinContent,
				setActiveContent,
				allSignals,
				map,
				sendMessage,
				createNewActivePin,
				setRefReady,
			}}
		>
			{children}
		</MapContext.Provider>
	);
};

export default MapProvider;
