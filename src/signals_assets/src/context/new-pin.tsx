import React, { useContext, useState } from "react";
import { PinType } from "../utils/mapSignalTypes";
import { MapContext } from "./map";

export enum CreationState {
	Starting = "starting",
	TypeSelection = "typeSelection",
	AddContent = "addContent",
	Created = "created",
}

export const NewPinContext = React.createContext<{
	setInteractionState: (state: CreationState) => void;
	setPinType: any;
	pinType: PinType;
	createSignal: () => void;
	selectType: (type: string) => void;
	interactionState: CreationState;
}>({} as any);

const NewPinProvider = ({ children }: any) => {
	const { pinType, setPinType } = useContext(MapContext);

	const [interactionState, setInterState] = useState(CreationState.Starting);

	const createSignal = () => {
		setInteractionState(CreationState.TypeSelection);
	};

	const setInteractionState = (state: CreationState) => {
		setInterState(state);
	};

	const selectType = (type: String) => {
		setPinType(type);
		setInteractionState(CreationState.AddContent);
	};

	return (
		<NewPinContext.Provider
			value={{
				setInteractionState,
				setPinType,
				pinType,
				createSignal,
				selectType,
				interactionState,
			}}
		>
			{children}
		</NewPinContext.Provider>
	);
};

export default NewPinProvider;
