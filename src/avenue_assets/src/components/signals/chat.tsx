import Rating from "../InteractionBox/Rating";
import MessagesList from "./Messages";

export default function ChatSig(
	pinUser: any,
	activeContent: any,
	sendMessageEv: any,
	activity: any
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
							<p>
								{
									activeContent?.signalMetadata?.metadata
										.contents
								}
							</p>
							<p>
								Posted by{" "}
								{pinUser?.name ? (
									pinUser?.name
								) : (
									<>
										{activeContent?.signalMetadata?.user.toString()}
									</>
								)}
							</p>

							<Rating signal={activeContent} />
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
