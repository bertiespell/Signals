import { Marker } from "leaflet";
import React, { useContext, useState } from "react";
import { MapContext } from "./map";
import { rust_avenue } from "../../../declarations/rust_avenue";

export const NewPinContext = React.createContext({});

export enum PinType {
	Chat = "chat",
	Trade = "trade",
	Event = "event",
}

const NewPinProvider = ({ children }: any) => {
	const { location, marker } = useContext(MapContext as any);

	const [pinType, setPinType] = useState(PinType.Chat);

	const sendSignal = async (e: Event, initial_message: string) => {
		e.preventDefault();
		const location = (marker as Marker).getLatLng();
		const chat = await rust_avenue.create_new_chat(
			{ lat: location.lat, long: location.lng },
			initial_message
		);
	};

	return (
		<NewPinContext.Provider
			value={{
				pinType,
				setPinType,
				sendSignal,
			}}
		>
			{children}
		</NewPinContext.Provider>
	);
};

export default NewPinProvider;
