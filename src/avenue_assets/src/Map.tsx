import * as React from "react";
import { rust_avenue } from "../../declarations/rust_avenue";
// import { MapContainer } from "https://cdn.esm.sh/react-leaflet/MapContainer";
// import { TileLayer } from "https://cdn.esm.sh/react-leaflet/TileLayer";
// import { useMap } from "https://cdn.esm.sh/react-leaflet/hooks";

const L = (window as any).L;

const Map = () => {
	const [greeting, setGreeting] = React.useState("");
	const [pending, setPending] = React.useState(false);
	const inputRef = React.useRef();

	const handleSubmit = async (e: any) => {
		e.preventDefault();
		if (pending) return;
		setPending(true);
		const name = (inputRef as any).current.value.toString();

		// Interact with hello actor, calling the greet method
		const greeting = await rust_avenue.greet(name);
		setGreeting(greeting);
		setPending(false);
		return false;
	};

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

	React.useEffect(() => {
		var map = L.map("map").setView([51.505, -0.09], 13);
		console.log(map);
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			maxZoom: 19,
			attribution: "© OpenStreetMap",
		}).addTo(map);

		var marker = L.marker([51.5, -0.09]).addTo(map);
		console.log(marker.getLatLng());
		tryThings();
	});

	return (
		<main>
			<div className="w-max h-max">
				<div id="map" className="w-max h-max">
					{/* <MapContainer
					center={position}
					zoom={13}
					scrollWheelZoom={false}
				>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Marker position={position}>
						<Popup>
							A pretty CSS3 popup. <br /> Easily customizable.
						</Popup>
					</Marker>
				</MapContainer> */}
				</div>
			</div>
		</main>
	);
};

export default Map;
