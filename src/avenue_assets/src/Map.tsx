import { useEffect, useRef, useState } from "react";
import { rust_avenue } from "../../declarations/rust_avenue";
import Chat from "./components/Chat";
import { Size, useWindowSize } from "./hooks/window-size";

const L = (window as any).L;

const Map = () => {
	const [mapInitialised, setMapInitialized] = useState(false);
	const size: Size = useWindowSize();

	const tryThings = async () => {
		console.log(rust_avenue.update);
		// const person = await rust_avenue.update({
		// 	name: "Luxi",
		// 	description: "Mountain dog",
		// 	keywords: ["scars", "toast"],
		// });
		const newDof = {
			name: "Dupree",
			description: "black dog",
			keywords: ["funny tail", "white nose"],
		};
		const person = await rust_avenue.update(newDof);
		console.log(person, "waaa");
		const person_two = await rust_avenue.getSelf();
		console.log(person_two);

		try {
			const person_three = await rust_avenue.search("black");
			console.log(person_three);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		window.navigator.geolocation.getCurrentPosition(
			(location) => {
				console.log("success", location);
				if (!mapInitialised) {
					var map = L.map("map").setView(
						[location.coords.latitude, location.coords.longitude],
						13
					);
					console.log(map);
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
					console.log(marker.getLatLng());
					tryThings();
					setMapInitialized(true);
				}
			},
			(error) => {
				console.log("error", error);
			}
		);
	});

	return (
		<main>
			<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
				<div id="map" style={{ height: size.height }}>
					<div id="map"></div>
				</div>
			</div>
		</main>
	);
};

export default Map;
