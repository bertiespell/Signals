import { useContext, useEffect, useState } from "react";
import { MapContext } from "../context/map";
import { ShowMapContext } from "../context/show-map";
import Map from "../Map";

import InteractionBox from "./InteractionBox/InteractionBox";

import { useLocation } from "react-router-dom";
import SignalContainer from "./Signals/SignalContainer";
import ProgressBar from "./InteractionBox/ProgressBar";

import Starting from "./InteractionBox/Interactions/Starting";
import TypeSelection from "./InteractionBox/Interactions/TypeSelection";
import ChatForm from "./NewContentForms/ChatForm";
import EventForm from "./NewContentForms/EventForm";
import TradeForm from "./NewContentForms/TradeForm";
import { UserContext } from "../context/user";

export enum CreationState {
	Starting = "starting",
	TypeSelection = "typeSelection",
	AddContent = "addContent",
	Created = "created",
}

export default function LayoutPanels() {
	const location = useLocation();
	const { activeContent } = useContext(MapContext);
	const { showMap } = useContext(ShowMapContext);

	const [visibility, setVisibility] = useState("visible");

	useEffect(() => {
		if (location.pathname !== "/") {
			setVisibility("hidden");
		} else {
			const visibility = showMap ? "" : "hidden";
			setVisibility(visibility);
		}
	}, [showMap, location]);

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
			<section
				aria-labelledby="primary-heading"
				className={`min-w-0 flex-1 h-full flex-col ${visibility}`}
			>
				<Map />
			</section>

			<aside
				className={`hidden lg:block lg:flex-shrink-0 lg:order-first ${visibility}`}
			>
				<div
					className={`h-full relative flex flex-col w-96 bg-white overflow-y-auto grid-cols-1 grid-rows-8 ${visibility}`}
				>
					{activeContent?.isNewPin ? (
						<>
							{stateToComponent[interactionState]}
							{authenicated ? (
								<>
									<div className="absolute inset-x-0 bottom-0 h-16">
										<ProgressBar
											setInteractionState={
												setInteractionState
											}
											interactionState={interactionState}
										/>
									</div>
								</>
							) : (
								""
							)}
						</>
					) : (
						<>
							<SignalContainer />
						</>
					)}
					{/* <>
						<div className="absolute inset-x-0 bottom-0 h-16">
							<ProgressBar
								setInteractionState={setInteractionState}
								interactionState={interactionState}
							/>
						</div>
					</> */}
				</div>
			</aside>
		</>
	);
}
