import { Marker } from "leaflet";
import React, { useEffect, useState } from "react";
import { rust_avenue } from "../../../declarations/rust_avenue";

export const MapContext = React.createContext({});

const L = (window as any).L;

type Signal = {
	location: {
		lat: number;
		long: number;
	};
	messages: Array<{
		contents: string;
		identity: string;
		time: string;
	}>;
};

const MapProvider = ({ children }: any) => {
	const [mapInitialised, setMapInitialized] = useState(false);
	const [map, setMap] = useState();
	const [marker, setMarker] = useState();
	const [location, setLocation] = useState<any>();
	const [allMarkers, setAllMarkers] = useState<Array<Marker>>([]);

	const setKnownSignals = async () => {
		const signals: Array<Signal> = await (
			rust_avenue as any
		).get_all_signals();

		var myIcon = L.icon({
			iconUrl: "../../chat-five.png",
			iconSize: [40, 40],
			iconAnchor: [40, 40],
			popupAnchor: [-3, -76],
		});

		signals.map((signal) => {
			var marker = L.marker([signal.location.lat, signal.location.long], {
				icon: myIcon,
			}).addTo(map);
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
					setLocation([
						location.coords.latitude,
						location.coords.longitude,
					]);
					L.tileLayer(
						"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
						{
							maxZoom: 19,
							attribution: "© OpenStreetMap",
						}
					).addTo(map);

					var marker = L.marker(
						[location.coords.latitude, location.coords.longitude],
						{ draggable: true }
					).addTo(map);
					setMarker(marker);
				}
			},
			(error) => {
				console.log("error", error);
			}
		);
	});
	return (
		<MapContext.Provider
			value={{
				mapInitialised,
				map,
				marker,
				location,
			}}
		>
			{children}
		</MapContext.Provider>
	);
};

export default MapProvider;
