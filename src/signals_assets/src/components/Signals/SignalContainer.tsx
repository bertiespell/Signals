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
	Coordinate,
	Profile,
	_SERVICE,
} from "../../../../declarations/signals/signals.did";

import Trade from "./Trade";
import ChatSig from "./Chat";
import Event from "./Event";
import { ActiveContent } from "../../utils/types";
import { signals } from "../../../../declarations/signals";
import { Principal } from "@dfinity/principal";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";

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
	date: Date;
};

export type TicketData = {
	numberOfTicketsRemaining: number;
	yourAttending: boolean;
	attendees: Array<Principal>;
	isTicketed: boolean;
};

export default function SignalContainer() {
	const { activeContent, sendMessage, createNewActivePin } = useContext<{
		sendMessage: any;
		activeContent: ActiveContent<SignalType>;
		createNewActivePin: any;
	}>(MapContext as any);
	const { authenticatedActor, authenticatedUser, user } =
		useContext(UserContext);
	const { allSignals } = useContext(MapContext);
	const [pinUser, setPinUser] = useState<Profile>();
	const [isOwnListing, setOwnListing] = useState(false);
	const [open, setOpen] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);

	const [activity, setActivity] = useState<Array<Activity>>([]);
	const [eventTicketInfo, setEventTicketInfo] = useState<TicketData>({
		numberOfTicketsRemaining: 0,
		yourAttending: false,
		attendees: [],
		isTicketed: false,
	});

	const deleteSignal = async () => {
		try {
			if (activeContent && authenticatedActor) {
				await authenticatedActor.delete_signal(
					activeContent.signalMetadata?.location as Coordinate
				);
				activeContent.isNewPin = false;
				activeContent.marker.remove();
				createNewActivePin();
				setOpen(true);
			}
		} catch (e) {
			setErrorOpen(true);
		}
	};

	const getUserForSignal = async () => {
		if (activeContent) {
			const user = await signals.get_user_for_signal_location(
				activeContent.signalMetadata?.location as any
			);
			setPinUser(user);
			if (user.principal.toString() === authenticatedUser?.toString()) {
				setOwnListing(true);
			} else {
				setOwnListing(false);
			}
		}
	};

	const getDataForTicketedEvent = async () => {
		if (
			activeContent &&
			(activeContent.signalMetadata?.metadata as any).numberOfTickets &&
			authenticatedUser?.toString() &&
			!authenticatedUser.isAnonymous() &&
			mapActiveContentToPinType(activeContent) === PinType.Event
		) {
			const ticket = await signals.get_event_details(
				activeContent.signalMetadata?.id as any
			);
			const ticketData = {
				numberOfTicketsRemaining: 0,
				yourAttending: false,
				attendees: [],
				isTicketed: true,
			};
			if (
				ticket.issued_passes.find(
					(pass) =>
						pass.toString() === authenticatedUser?.toString() &&
						!authenticatedUser.isAnonymous()
				)
			) {
				ticketData.yourAttending = true;
			}
			if (ticket.issued_passes.length < ticket.number_of_tickets) {
				ticketData.numberOfTicketsRemaining =
					ticket.number_of_tickets - ticket.issued_passes.length;
				ticketData.attendees = ticket.issued_passes as any;
			}
			setEventTicketInfo(ticketData);
		}
	};

	useEffect(() => {
		setActivity([]);
		addMessages();
		getDataForTicketedEvent();
		getUserForSignal();
	}, [allSignals, activeContent]);

	const buyTicket = async () => {
		await authenticatedActor?.claim_ticket(
			activeContent.signalMetadata?.id as any
		);
		getDataForTicketedEvent();
	};

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
				date: new Date(message.time),
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
				return Trade(
					pinUser,
					isOwnListing,
					content,
					sendMessageEv,
					activity,
					authenticatedActor,
					deleteSignal
				);
			if (type === PinType.Chat)
				return ChatSig(
					pinUser,
					isOwnListing,
					content,
					sendMessageEv,
					activity,
					deleteSignal
				);
			if (type === PinType.Event)
				return Event(
					pinUser,
					isOwnListing,
					content,
					sendMessageEv,
					activity,
					eventTicketInfo,
					buyTicket,
					authenticatedUser as Principal,
					deleteSignal
				);
		}
	};

	return (
		<>
			{activeContent && mapSignalTypeToComponent(activeContent)}
			<>
				<ErrorAlert
					setOpen={setErrorOpen}
					open={errorOpen}
					title={"Error"}
					message={
						"Sorry, there was an issue performing your request."
					}
				/>
				<SuccessAlert
					setOpen={setOpen}
					open={open}
					title={"Success"}
					message={"Your signal has been deleted."}
				/>
			</>
		</>
	);
}
