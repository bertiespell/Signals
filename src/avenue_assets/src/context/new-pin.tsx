import React, { useContext, useEffect, useState } from "react";
import { MapContext } from "./map";

export const NewPinContext = React.createContext({});

export enum PinType {
	Chat = "chat",
	Trade = "trade",
	Event = "event",
}

const NewPinProvider = ({ children }: any) => {
	const { location, marker } = useContext(MapContext as any);

	const [pinType, setPinType] = useState(PinType.Chat);

	const sendSignal = () => {
		console.log("Sending signal... to icp");
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
