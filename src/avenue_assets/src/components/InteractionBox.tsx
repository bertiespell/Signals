import { Marker } from "leaflet";
import { useContext, useState } from "react";
import { MapContext } from "../context/map";
import { NewPinContext } from "../context/new-pin";
import PinContent from "./interactions/PinContent";
import Starting from "./interactions/Starting";
import TypeSelection from "./interactions/TypeSelection";

enum CreationState {
	Starting = "starting",
	TypeSelection = "typeSelection",
	AddContent = "addContent",
	Created = "created",
}

export default function InteractionBox() {
	const { pinType, setPinType } = useContext(NewPinContext as any);
	const { marker } = useContext(MapContext as any);

	const [interactionState, setInteractionState] = useState(
		CreationState.Starting
	);

	const createSignal = () => {
		marker.dragging.disable();
		setInteractionState(CreationState.TypeSelection);
	};

	const selectType = (type: String) => {
		setPinType(type);
		setInteractionState(CreationState.AddContent);
	};

	const stateToComponent = {
		starting: (
			<>
				<Starting createSignal={createSignal} />
			</>
		),
		typeSelection: (
			<>
				<TypeSelection selectType={selectType} />
			</>
		),
		addContent: (
			<>
				<PinContent contentType={pinType} />
			</>
		),
		created: <></>,
	};
	return <>{stateToComponent[interactionState]}</>;
}
