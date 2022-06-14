import { ActorSubclass } from "@dfinity/agent";
import { Marker } from "leaflet";
import React, { useContext, useEffect, useState } from "react";
import { signals } from "../../../declarations/signals";
import {
	_SERVICE,
	Signal as RustSignal,
} from "../../../declarations/signals/signals.did";
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
import { ActiveContent, MapContextType, Message, Signal } from "../utils/types";
import { defaultLocation } from "../utils/defaults";
import "../utils/leaflet-search";

const L = (window as any).L;

export const MapContext = React.createContext<MapContextType<SignalType>>(
	{} as any
);

const MapProvider = ({ children }: any) => {
	const { authenticatedActor, authenticatedUser } = useContext(UserContext);

	const [activeContent, setActiveContent] =
		useState<ActiveContent<SignalType>>();
	const [pinType, setPinType] = useState(PinType.Chat);
	const [mapInitialised, setMapInitialized] = useState(false);
	const [showTooltip, setShowToolTip] = useState(false);

	const [map, setMap] = useState();
	const [allMarkers, setAllMarkers] = useState<Array<Marker>>([]);
	const [allSignals, setAllSignals] = useState<
		Array<ActiveContent<SignalType>>
	>([]);
	const [newPinContent, setNewPinContent] =
		useState<ActiveContent<SignalType>>();
	const [refReady, setRefAsReady] = useState(false);

	useEffect(() => {
		if (!mapInitialised && refReady) {
			setMapInitialized(true);
			const location = defaultLocation;

			const map = L.map("map", {
				maxZoom: 19,
				worldCopyJump: true,
			}).setView(
				[location.coords.latitude, location.coords.longitude],
				13
			);
			setMap(map);
			L.tileLayer(
				"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			).addTo(map);
			const search = new L.Control.Search({
				url: "https://nominatim.openstreetmap.org/search?format=json&q={s}",
				jsonpParam: "json_callback",
				propertyName: "display_name",
				propertyLoc: ["lat", "lon"],
				hideMarkerOnCollapse: true,
				marker: L.circleMarker([0, 0], { radius: 30 }),
				autoCollapse: true,
				autoType: false,
				minLength: 2,
			});
			map.addControl(search);
			map.attributionControl.setPrefix("");
			addNewPin(location as any, map);
		}
	}, [refReady]);

	useEffect(() => {
		if (map) {
			setKnownSignals();
		}
	}, [map]);
	useEffect(() => {
		if (map) {
			setKnownSignals();
		}
	}, [refReady]);

	useEffect(() => {
		getLocationWithMap();
	}, [refReady, mapInitialised, map]);

	const setRefReady = () => {
		setRefAsReady(true);
	};

	const sendMessage = async (
		activeContent: ActiveContent<SignalType>,
		message: string
	) => {
		const updateActiveContent = () => {
			const new_content = Object.create(activeContent);

			new_content?.signalMetadata?.messages.push({
				contents: message,
				identity: (authenticatedUser as any).toString(),
				time: new Date(Number(Date.now())).toString(),
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

	const transformSignal = (signal: RustSignal) => {
		// when we reset data structure we can remove this try block

		let created_at_unix_timestamp = Number(signal.created_at).toString();

		// multiplied by 1000 so that the argument is in milliseconds, not seconds.
		const created_at = new Date(
			Number(created_at_unix_timestamp.slice(0, 10)) * 1000
		);

		let updated_at_unix_timestamp = Number(signal.updated_at).toString();

		// multiplied by 1000 so that the argument is in milliseconds, not seconds.
		const updated_at = new Date(
			Number(updated_at_unix_timestamp.slice(0, 10)) * 1000
		);

		const messages: Array<Message> = signal.messages.map((message) => {
			let message_time = Number(message.time).toString();
			let identity = message.identity.name
				? message.identity.name
				: message.identity.principal.toString();

			// multiplied by 1000 so that the argument is in milliseconds, not seconds.
			const time = new Date(
				Number(message_time.slice(0, 10)) * 1000
			).toString();
			return { contents: message.contents, time, identity };
		});

		const formattedSignal: Signal<SignalType> = {
			...signal,
			id: Number(signal.id),
			created_at,
			updated_at,
			metadata: JSON.parse(signal.metadata as any),
			messages,
			username: signal.user.toString(),
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
		const knownSignals: Array<RustSignal> = await (
			signals as any
		).get_all_signals();

		let allSignals: Array<ActiveContent<SignalType>> = [];
		knownSignals.map((signal) => {
			const activeContent = transformSignal(signal);
			allSignals.push(activeContent);
		});
		setAllSignals(allSignals);
	};

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

				setShowToolTip(!showTooltip);
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
				const map = L.map("map", { worldCopyJump: true }).setView(
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
				map.addControl(
					new L.Control.Search({
						url: "https://nominatim.openstreetmap.org/search?format=json&q={s}",
						jsonpParam: "json_callback",
						propertyName: "display_name",
						propertyLoc: ["lat", "lon"],
						hideMarkerOnCollapse: true,
						marker: L.circleMarker([0, 0], { radius: 30 }),
						autoCollapse: true,
						autoType: false,
						minLength: 2,
					})
				);
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

	const sendSignal = async (
		e: Event,
		contents: EventSignal | Trade | Chat
	) => {
		e.preventDefault();
		if (activeContent && activeContent.isNewPin) {
			const location = activeContent?.marker.getLatLng();
			const signalType = mapSignalToType(pinType);
			try {
				let signal;
				if ((contents as EventSignal).numberOfTickets) {
					signal = (await authenticatedActor?.create_ticketed_signal(
						{ lat: location.lat, long: location.lng },
						JSON.stringify(contents),
						signalType,
						Number((contents as EventSignal).numberOfTickets)
					)) as unknown as RustSignal;
				} else {
					signal = (await authenticatedActor?.create_new_signal(
						{ lat: location.lat, long: location.lng },
						JSON.stringify(contents),
						signalType
					)) as unknown as RustSignal;
				}

				// remove the newsignal marker
				activeContent.isNewPin = false;
				activeContent.marker.remove();
				setNewPinContent(undefined);

				// add it to known signals
				let newAllSignals: Array<ActiveContent<SignalType>> =
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
				setKnownSignals,
			}}
		>
			{children}
		</MapContext.Provider>
	);
};

export default MapProvider;
