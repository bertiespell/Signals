import { Marker } from "leaflet";
import React, { useContext, useState } from "react";
import { MapContext } from "./map";
import { rust_avenue } from "../../../declarations/rust_avenue";
import { mapSignalToType, PinType } from "../utils/mapSignalTypes";

export const NewPinContext = React.createContext({});

const NewPinProvider = ({ children }: any) => {
	const { marker } = useContext(MapContext as any);

	const [pinType, setPinType] = useState(PinType.Chat);

	const sendSignal = async (e: Event, initial_message: string) => {
		e.preventDefault();
		const location = (marker as Marker).getLatLng();
		const coveretedSignalType = mapSignalToType(pinType);
		const chat = await rust_avenue.create_new_chat(
			{ lat: location.lat, long: location.lng },
			initial_message,
			coveretedSignalType
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
