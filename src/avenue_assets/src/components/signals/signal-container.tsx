import { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { MapContext } from "../../context/map";
import {
	mapActiveContentToPinType,
	PinType,
	SignalType,
} from "../../utils/mapSignalTypes";
import { UserContext } from "../../context/user";
import {
	Profile,
	_SERVICE,
} from "../../../../declarations/rust_avenue/rust_avenue.did";

import Trade from "./trade";
import ChatSig from "./chat";
import Event from "./event";
import { ActiveContent } from "../../utils/types";

export type Person = {
	name: string;
	href: string;
};

export type Activity = {
	id: string;
	person: Person;
	assigned?: Person;
	imageUrl: string;
	comment: string;
	date: string;
};

export default function SignalContainer() {
	const { activeContent, sendMessage } = useContext<{
		sendMessage: any;
		activeContent: ActiveContent<SignalType>;
	}>(MapContext as any);
	const { authenticatedActor } = useContext(UserContext);
	const { allSignals } = useContext(MapContext);
	const [pinUser, setPinUser] = useState<Profile>();
	const [activity, setActivity] = useState<Array<Activity>>([]);

	const getUserForSignal = async () => {
		const user = await authenticatedActor?.get_user_for_signal_location(
			activeContent.signalMetadata?.location as any
		);
		setPinUser(user);
	};

	useEffect(() => {
		getUserForSignal();
	}, [authenticatedActor]);

	useEffect(() => {
		setActivity([]);
		addMessages();
	}, [allSignals, activeContent]);

	const sendMessageEv = async (e: Event, message: string) => {
		e.preventDefault();
		if (activeContent?.signalMetadata && authenticatedActor && message) {
			sendMessage(activeContent, message);
			setActivity([]);
			addMessages();
		}
	};

	const addMessages = () => {
		const newActivity: Array<Activity> = [];
		activeContent?.signalMetadata?.messages.map((message) => {
			newActivity.push({
				comment: message.contents,
				date: message.time,
				imageUrl:
					"https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png",
				id: uuidv4().toString(),
				person: {
					name: message.identity,
					href: "",
				},
			});
		});

		setActivity(newActivity);
	};

	const mapSignalTypeToComponent = (content: ActiveContent<any>) => {
		let type = mapActiveContentToPinType(content);
		if (pinUser && content) {
			if (type === PinType.Trade)
				return Trade(pinUser, content, sendMessageEv, activity);
			if (type === PinType.Chat)
				return ChatSig(pinUser, content, sendMessageEv, activity);
			if (type === PinType.Event)
				return Event(pinUser, content, sendMessageEv, activity);
		}
	};

	return <>{activeContent && mapSignalTypeToComponent(activeContent)}</>;
}
