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
} from "../../../../declarations/rust_avenue/rust_avenue.did";

import Trade from "./Trade";
import ChatSig from "./Chat";
import Event from "./Event";
import { ActiveContent } from "../../utils/types";
import { rust_avenue } from "../../../../declarations/rust_avenue";
import { Principal } from "@dfinity/principal";

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

export type TicketData = {
	numberOfTicketsRemaining: number;
	yourAttending: boolean;
	attendees: Array<Principal>;
	isTicketed: boolean;
};

export default function SignalContainer() {
	const { activeContent, sendMessage } = useContext<{
		sendMessage: any;
		activeContent: ActiveContent<SignalType>;
	}>(MapContext as any);
	const { authenticatedActor, authenticatedUser, user } =
		useContext(UserContext);
	const { allSignals } = useContext(MapContext);
	const [pinUser, setPinUser] = useState<Profile>();
	const [isOwnListing, setOwnListing] = useState(false);

	const [activity, setActivity] = useState<Array<Activity>>([]);
	const [eventTicketInfo, setEventTicketInfo] = useState<TicketData>({
		numberOfTicketsRemaining: 0,
		yourAttending: false,
		attendees: [],
		isTicketed: false,
	});

	const deleteSignal = async () => {
		if (activeContent && authenticatedActor) {
			console.log(
				"delete",
				authenticatedUser?.toString(),
				activeContent.signalMetadata?.user.toString()
			);

			const deleted = await authenticatedActor.delete_signal(
				activeContent.signalMetadata?.location as Coordinate
			);
			console.log("deleted!!)", deleted);
		}
	};

	const getUserForSignal = async () => {
		if (activeContent) {
			const user = await rust_avenue.get_user_for_signal_location(
				activeContent.signalMetadata?.location as any
			);
			setPinUser(user);
			if (user.principal.toString() === authenticatedUser?.toString()) {
				setOwnListing(true);
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
			const ticket = await rust_avenue.get_event_details(
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
				date: message.time,
				imageUrl:
					"https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png",
				id: uuidv4().toString(),
				person: {
					name: user?.name ? user?.name : message.identity,
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

	return <>{activeContent && mapSignalTypeToComponent(activeContent)}</>;
}
