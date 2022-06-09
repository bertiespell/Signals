import { Fragment, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import {
	ChatAltIcon,
	TagIcon,
	UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/solid";
import { ActiveContent, MapContext } from "../../context/map";
import { rust_avenue } from "../../../../declarations/rust_avenue";
import { Chat } from "../../utils/mapSignalTypes";
import { UserContext } from "../../context/user";
import { ActorSubclass } from "@dfinity/agent";
import { _SERVICE } from "../../../../declarations/rust_avenue/rust_avenue.did";

export type Person = {
	name: string;
	href: string;
};

export type Activity = {
	id: string;
	type: string;
	person: Person;
	assigned?: Person;
	imageUrl: string;
	comment: string;
	date: string;
	tags?: Array<{
		name: string;
		href: string;
		color: string;
	}>;
};

function classNames(...classes: any) {
	return classes.filter(Boolean).join(" ");
}

export default function Chat() {
	const { activeContent } = useContext<{
		activeContent: ActiveContent<Chat>;
	}>(MapContext as any);
	const { authenticatedActor } = useContext(UserContext);

	const [newMessage, setNewMessage] = useState("");
	const [activity, setActivity] = useState<Array<Activity>>([]);

	const sendMessage = async (e: Event, message: string) => {
		e.preventDefault();
		if (activeContent?.signalMetadata && authenticatedActor) {
			const signal = await (
				authenticatedActor as unknown as ActorSubclass<_SERVICE>
			).add_new_message(activeContent?.signalMetadata?.location, message);
			const newActivity: Array<Activity> = [];
			signal.messages.map((message) => {
				newActivity.push({
					comment: message.contents,
					date: message.time as any,
					type: "comment",
					imageUrl:
						"https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png",
					id: uuidv4().toString(),
					person: {
						name: message.identity,
						href: "",
					},
				});
			});
			setNewMessage("");
			setActivity(newActivity);
		}
	};

	const addChat = () => {
		const newActivity: Array<Activity> = [];

		// first message has some additional metadata
		newActivity.push({
			comment: activeContent?.signalMetadata?.metadata.contents as string,
			date: activeContent?.signalMetadata?.created_at as string,
			type: "comment",
			imageUrl:
				"https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png",
			id: uuidv4().toString(),
			person: {
				name: activeContent?.signalMetadata?.user.toString() as string,
				href: "",
			},
		});

		// the rest of the messages can be pushed like this
		activeContent?.signalMetadata?.messages.map((message) => {
			newActivity.push({
				comment: message.contents,
				date: message.time,
				type: "comment",
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

	useEffect(() => {
		// when activeContent changes we need to reset the state to be blank
		setNewMessage("");
		setActivity([]);
		addChat();
	}, [activeContent]);

	return (
		<>
			<div className="p-5 pt-10 mt-8 lg:mt-0">
				<section
					aria-labelledby="activity-title"
					className="mt-8 xl:mt-10"
				>
					<div>
						<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
							{activeContent?.signalMetadata?.metadata.title}
						</h3>

						<div className="divide-y divide-gray-200">
							<div className="pt-6">
								{/* Activity feed*/}
								<div className="flow-root">
									<ul role="list" className="-mb-8">
										{activity.map((item, itemIdx) => (
											<li key={item.id}>
												<div className="relative pb-8">
													{itemIdx !==
													activity.length - 1 ? (
														<span
															className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
															aria-hidden="true"
														/>
													) : null}
													<div className="relative flex items-start space-x-3">
														{item.type ===
														"comment" ? (
															<>
																<div className="relative">
																	<img
																		className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
																		src={
																			item.imageUrl
																		}
																		alt=""
																	/>

																	<span className="absolute -bottom-0.5 -right-1 bg-white rounded-tl px-0.5 py-px">
																		<ChatAltIcon
																			className="h-5 w-5 text-gray-400"
																			aria-hidden="true"
																		/>
																	</span>
																</div>
																<div className="min-w-0 flex-1">
																	<div>
																		<div className="text-sm">
																			<a
																				href={
																					item
																						.person
																						.href
																				}
																				className="font-medium text-gray-900"
																			>
																				{
																					item
																						.person
																						.name
																				}
																			</a>
																		</div>
																		<p className="mt-0.5 text-sm text-gray-500">
																			Commented{" "}
																			{
																				item.date
																			}
																		</p>
																	</div>
																	<div className="mt-2 text-sm text-gray-700">
																		<p>
																			{
																				item.comment
																			}
																		</p>
																	</div>
																</div>
															</>
														) : item.type ===
														  "assignment" ? (
															<>
																<div>
																	<div className="relative px-1">
																		<div className="h-8 w-8 bg-gray-100 rounded-full ring-8 ring-white flex items-center justify-center">
																			<UserCircleIconSolid
																				className="h-5 w-5 text-gray-500"
																				aria-hidden="true"
																			/>
																		</div>
																	</div>
																</div>
																<div className="min-w-0 flex-1 py-1.5">
																	<div className="text-sm text-gray-500">
																		<a
																			href={
																				item
																					.person
																					.href
																			}
																			className="font-medium text-gray-900"
																		>
																			{
																				item
																					.person
																					.name
																			}
																		</a>{" "}
																		assigned{" "}
																		<a
																			href={
																				item
																					.assigned
																					?.href
																			}
																			className="font-medium text-gray-900"
																		>
																			{
																				item
																					.assigned
																					?.name
																			}
																		</a>{" "}
																		<span className="whitespace-nowrap">
																			{
																				item.date
																			}
																		</span>
																	</div>
																</div>
															</>
														) : (
															<>
																<div>
																	<div className="relative px-1">
																		<div className="h-8 w-8 bg-gray-100 rounded-full ring-8 ring-white flex items-center justify-center">
																			<TagIcon
																				className="h-5 w-5 text-gray-500"
																				aria-hidden="true"
																			/>
																		</div>
																	</div>
																</div>
																<div className="min-w-0 flex-1 py-0">
																	<div className="text-sm leading-8 text-gray-500">
																		<span className="mr-0.5">
																			<a
																				href={
																					item
																						.person
																						.href
																				}
																				className="font-medium text-gray-900"
																			>
																				{
																					item
																						.person
																						.name
																				}
																			</a>{" "}
																			added
																			tags
																		</span>{" "}
																		<span className="mr-0.5">
																			{item.tags?.map(
																				(
																					tag
																				) => (
																					<Fragment
																						key={
																							tag.name
																						}
																					>
																						<a
																							href={
																								tag.href
																							}
																							className="relative inline-flex items-center rounded-full border border-gray-300 px-3 py-0.5 text-sm"
																						>
																							<span className="absolute flex-shrink-0 flex items-center justify-center">
																								<span
																									className={classNames(
																										tag.color,
																										"h-1.5 w-1.5 rounded-full"
																									)}
																									aria-hidden="true"
																								/>
																							</span>
																							<span className="ml-3.5 font-medium text-gray-900">
																								{
																									tag.name
																								}
																							</span>
																						</a>{" "}
																					</Fragment>
																				)
																			)}
																		</span>
																		<span className="whitespace-nowrap">
																			{
																				item.date
																			}
																		</span>
																	</div>
																</div>
															</>
														)}
													</div>
												</div>
											</li>
										))}
									</ul>
								</div>
								<div className="mt-6">
									<div className="flex space-x-3">
										<div className="flex-shrink-0">
											<div className="relative">
												<img
													className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
													src="https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png"
													alt=""
												/>

												<span className="absolute -bottom-0.5 -right-1 bg-white rounded-tl px-0.5 py-px">
													<ChatAltIcon
														className="h-5 w-5 text-gray-400"
														aria-hidden="true"
													/>
												</span>
											</div>
										</div>
										<div className="min-w-0 flex-1">
											<form action="#">
												<div>
													<label
														htmlFor="comment"
														className="sr-only"
													>
														Comment
													</label>
													<textarea
														id="comment"
														name="comment"
														rows={3}
														className="shadow-sm block w-full focus:ring-gray-900 focus:border-gray-900 sm:text-sm border border-gray-300 rounded-md"
														placeholder="Add a new message..."
														value={newMessage}
														onChange={(e) =>
															setNewMessage(
																e.target.value
															)
														}
													/>
												</div>
												<div className="mt-6 flex items-center justify-end space-x-4">
													<button
														type="submit"
														className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
														onClick={(e) =>
															sendMessage(
																e as any,
																newMessage
															)
														}
													>
														Send Signal
													</button>
												</div>
											</form>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
