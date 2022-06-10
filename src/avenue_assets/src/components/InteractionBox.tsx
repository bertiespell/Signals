import { useContext, useState } from "react";
import { MapContext } from "../context/map";
import Starting from "./interactions/Starting";
import TypeSelection from "./interactions/TypeSelection";
import ChatForm from "./newContentForms/ChatForm";
import EventForm from "./newContentForms/EventForm";
import TradeForm from "./newContentForms/TradeForm";
import ProgressBar from "./ProgressBar";

export enum CreationState {
	Starting = "starting",
	TypeSelection = "typeSelection",
	AddContent = "addContent",
	Created = "created",
}

export default function InteractionBox() {
	const { pinType, setPinType, activeContent } = useContext(MapContext);

	const [interactionState, setInterState] = useState(CreationState.Starting);

	const createSignal = () => {
		activeContent?.marker.dragging?.disable();
		setInteractionState(CreationState.TypeSelection);
	};

	const setInteractionState = (state: CreationState) => {
		activeContent?.marker.dragging?.disable();
		if (state === CreationState.Starting) {
			activeContent?.marker.dragging?.enable();
		}
		setInterState(state);
	};

	const selectType = (type: String) => {
		setPinType(type);
		setInteractionState(CreationState.AddContent);
	};

	const mapNewContentPanelToType = {
		chat: (
			<>
				<ChatForm />
			</>
		),
		event: (
			<>
				<EventForm />
			</>
		),
		trade: (
			<>
				<TradeForm />
			</>
		),
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
		addContent: <>{mapNewContentPanelToType[pinType]}</>,
		created: <></>,
	};
	return (
		<>
			{stateToComponent[interactionState]}
			<div className="absolute inset-x-0 bottom-0 h-16">
				<ProgressBar
					setInteractionState={setInteractionState}
					interactionState={interactionState}
				/>
			</div>
		</>
	);
}
