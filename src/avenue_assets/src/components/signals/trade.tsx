import Rating from "../Rating";
import MessagesList from "./messages";

export default function Trade(
	pinUser: any,
	activeContent: any,
	sendMessageEv: any,
	activity: any
) {
	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<div>
				<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
					{activeContent?.signalMetadata?.metadata.title}
				</h3>
				<Rating signal={activeContent} />

				<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
					<p className="text-lg text-gray-500">
						{activeContent?.signalMetadata?.metadata.description}
					</p>
				</div>
				<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
					<p className="text-lg text-gray-500">
						Price: {activeContent?.signalMetadata?.metadata.price}
					</p>
				</div>
				<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
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
						Created on: {activeContent?.signalMetadata?.created_at}
					</p>
				</div>
			</div>

			<MessagesList sendMessageEv={sendMessageEv} activity={activity} />
		</div>
	);
}
