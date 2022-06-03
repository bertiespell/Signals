import React, { useEffect, useState } from "react";

export const MapContext = React.createContext({});

const L = (window as any).L;

const MapProvider = ({ children }: any) => {
	const [mapInitialised, setMapInitialized] = useState(false);
	const [map, setMap] = useState();
	const [marker, setMarker] = useState();
	const [location, setLocation] = useState<any>();

	useEffect(() => {
		window.navigator.geolocation.getCurrentPosition(
			(location) => {
				console.log("success", location);
				if (!mapInitialised) {
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
					setMapInitialized(true);
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
