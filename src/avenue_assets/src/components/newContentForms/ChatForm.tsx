import { Fragment, useContext, useState } from "react";

import {
	ChatAltIcon,
	TagIcon,
	UserCircleIcon as UserCircleIconSolid,
} from "@heroicons/react/solid";
import { MapContext } from "../../context/map";
import { Activity } from "../signals/chat";

const activity: Array<Activity> = [];

function classNames(...classes: any) {
	return classes.filter(Boolean).join(" ");
}

export default function ChatForm() {
	const { sendSignal } = useContext(MapContext);
	const [contents, setContents] = useState("");
	const [title, setTitle] = useState("");

	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
				Create a chat
			</h2>
			<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				Add a Message
			</h3>
			<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					Once you add a signal it will be available for everyone to
					view on the map. Other users will be able to interact with
					your signal and send further messages.
				</p>
			</div>
			<section aria-labelledby="activity-title" className="mt-8 xl:mt-10">
				<div>
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
													{item.type === "comment" ? (
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
									<div className="min-w-0 flex-1">
										<form action="#">
											<div className="p-3">
												<label
													htmlFor="event-title"
													className="block text-sm font-medium text-gray-700"
												>
													Chat Title
												</label>
												<input
													type="text"
													name="event-title"
													id="event-title"
													value={title}
													onChange={(e) =>
														setTitle(e.target.value)
													}
													className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
												/>
											</div>
											<div className="p-3">
												<label
													htmlFor="about"
													className="block text-sm font-medium text-gray-700"
												>
													Message
												</label>
												<div className="mt-1">
													<textarea
														id="about"
														name="about"
														rows={8}
														value={contents}
														onChange={(e) =>
															setContents(
																e.target.value
															)
														}
														className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
														placeholder="Leave a first message for everyone"
													/>
												</div>
											</div>
											<div className="mt-6 flex items-center justify-end space-x-4">
												<button
													type="submit"
													className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
													onClick={(e) =>
														sendSignal(e, {
															title,
															contents,
														})
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
	);
}