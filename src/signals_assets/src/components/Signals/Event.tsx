import { Principal } from "@dfinity/principal";
import { EventSignal } from "../../utils/mapSignalTypes";
import { ActiveContent } from "../../utils/types";
import DeleteButton from "../InteractionBox/DeleteButton";
import Rating from "../InteractionBox/Rating";
import MessagesList from "./Messages";
import { TicketData } from "./SignalContainer";

export default function Event(
	pinUser: any,
	isOwnListing: boolean,
	activeContent: ActiveContent<EventSignal>,
	sendMessageEv: any,
	activity: any,
	eventTicketInfo: TicketData,
	buyTicket: any,
	authenticatedUser: Principal,
	deleteSignal: any
) {
	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				{activeContent?.signalMetadata?.metadata.title}
			</h3>

			<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					{activeContent?.signalMetadata?.metadata.description}
				</p>
			</div>
			<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					{activeContent?.signalMetadata?.metadata.date}
				</p>
			</div>
			<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					Posted by{" "}
					{pinUser?.name ? (
						pinUser?.name
					) : (
						<>{activeContent?.signalMetadata?.user.toString()}</>
					)}
				</p>
			</div>
			{eventTicketInfo.isTicketed &&
			authenticatedUser?.toString() &&
			!authenticatedUser.isAnonymous() ? (
				<>
					{eventTicketInfo.numberOfTicketsRemaining &&
					!eventTicketInfo.yourAttending ? (
						<div className="pt-5">
							<div className="mt-10 row-span-3">
								<button
									type="button"
									className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-signalBlue-200 hover:bg-signalBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signalBlue-500"
									onClick={buyTicket}
								>
									Buy Ticket
								</button>
							</div>
						</div>
					) : (
						<>
							{eventTicketInfo.yourAttending ? (
								<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
									<p className="text-lg text-gray-500">
										<b>You're attending this event!</b>
									</p>
								</div>
							) : (
								<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
									<p className="text-lg text-gray-500">
										<b>Sorry, this event is sold out!</b>
									</p>
								</div>
							)}
						</>
					)}
				</>
			) : (
				""
			)}

			{isOwnListing ? (
				<DeleteButton deleteSignal={deleteSignal} />
			) : (
				<Rating signal={activeContent} />
			)}

			<MessagesList sendMessageEv={sendMessageEv} activity={activity} />
		</div>
	);
}
