import { ActorSubclass, SignIdentity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { useContext, useEffect } from "react";
import { _SERVICE } from "../../../../declarations/signals/signals.did";
import { UserContext } from "../../context/user";
import { Trade } from "../../utils/mapSignalTypes";
import { ActiveContent } from "../../utils/types";
import DeleteButton from "../InteractionBox/DeleteButton";
import Rating from "../InteractionBox/Rating";
import MessagesList from "./Messages";

export default function Trade(
	pinUser: any,
	isOwnListing: boolean,
	activeContent: ActiveContent<Trade>,
	sendMessageEv: any,
	activity: any,
	authenticatedActor: ActorSubclass<_SERVICE> | undefined,
	deleteSignal: any
) {
	const buy = async () => {
		if (authenticatedActor && activeContent) {
			await authenticatedActor.buy_item(
				BigInt(activeContent.signalMetadata?.id as number),
				BigInt(
					Number(
						activeContent.signalMetadata?.metadata.price
					) as number
				)
			);
		}
	};

	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<div>
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
						Price: {activeContent?.signalMetadata?.metadata.price}
					</p>
				</div>
				<div className="mt-6 flex items-center justify-start space-x-4">
					{/* <button
						type="submit"
						className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
						onClick={buy}
					>
						Buy
					</button> */}
				</div>
				<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
					<p className="text-lg text-gray-500">
						Sold by:{" "}
						{pinUser?.name ? (
							pinUser?.name
						) : (
							<>
								{activeContent?.signalMetadata?.user.toString()}
							</>
						)}
					</p>
					<p className="text-lg text-gray-500">
						Created on:{" "}
						{activeContent?.signalMetadata?.created_at.toLocaleDateString(
							"en-gb",
							{
								year: "numeric",
								month: "long",
								day: "numeric",
							}
						)}
					</p>
				</div>
			</div>
			{isOwnListing ? (
				<DeleteButton deleteSignal={deleteSignal} />
			) : (
				<Rating signal={activeContent} />
			)}
			<MessagesList sendMessageEv={sendMessageEv} activity={activity} />
		</div>
	);
}
