import DeleteButton from "../InteractionBox/DeleteButton";
import Rating from "../InteractionBox/Rating";
import MessagesList from "./Messages";

export default function ChatSig(
	pinUser: any,
	isOwnListing: boolean,
	activeContent: any,
	sendMessageEv: any,
	activity: any,
	deleteSignal: any
) {
	return (
		<>
			<div className="p-5 pt-10 mt-8 lg:mt-0">
				<section
					aria-labelledby="activity-title"
					className="mt-8 xl:mt-10"
				>
					<div>
						<div>
							<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
								{activeContent?.signalMetadata?.metadata.title}
							</h3>

							<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
								<p className="text-lg text-gray-500">
									{
										activeContent?.signalMetadata?.metadata
											.contents
									}
								</p>
							</div>

							<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
								<p className="text-lg text-gray-500">
									Posted by{" "}
									{pinUser?.name ? (
										pinUser?.name
									) : (
										<>
											{activeContent?.signalMetadata?.user.toString()}
										</>
									)}{" "}
									on{" "}
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

							{isOwnListing ? (
								<DeleteButton deleteSignal={deleteSignal} />
							) : (
								<Rating signal={activeContent} />
							)}
						</div>

						<MessagesList
							sendMessageEv={sendMessageEv}
							activity={activity}
						/>
					</div>
				</section>
			</div>
		</>
	);
}
