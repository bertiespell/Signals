import { useContext, useEffect, useState } from "react";
import { MapContext } from "../../context/map";
import Starting from "./Interactions/Starting";
import TypeSelection from "./Interactions/TypeSelection";
import ChatForm from "../NewContentForms/ChatForm";
import EventForm from "../NewContentForms/EventForm";
import TradeForm from "../NewContentForms/TradeForm";
import ProgressBar from "./ProgressBar";
import { UserContext } from "../../context/user";

export enum CreationState {
	Starting = "starting",
	TypeSelection = "typeSelection",
	AddContent = "addContent",
	Created = "created",
}

export default function InteractionBox() {
	const { authenticatedUser } = useContext(UserContext);
	const { pinType, setPinType } = useContext(MapContext);

	const [authenicated, setAuthenicated] = useState(false);
	const [interactionState, setInterState] = useState(CreationState.Starting);

	useEffect(() => {
		if (authenticatedUser && !authenticatedUser?.isAnonymous()) {
			setAuthenicated(true);
		}
	}, [authenticatedUser]);

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
			{authenicated ? (
				<>
					<div className="absolute inset-x-0 bottom-0 h-16">
						<ProgressBar
							setInteractionState={setInteractionState}
							interactionState={interactionState}
						/>
					</div>
				</>
			) : (
				""
			)}
		</>
	);
}
