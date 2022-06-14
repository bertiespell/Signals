import { ChatAltIcon } from "@heroicons/react/outline";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/user";
import { Activity } from "./SignalContainer";

export default function MessagesList({
	activity,
	sendMessageEv,
}: {
	activity: Array<Activity>;
	sendMessageEv: (event: any, message: string) => void;
}) {
	const { authenticatedUser, login } = useContext(UserContext);

	const [authenicated, setAuthenicated] = useState(false);
	const [newMessage, setNewMessage] = useState("");

	useEffect(() => {
		if (authenticatedUser && !authenticatedUser?.isAnonymous()) {
			setAuthenicated(true);
		}
	}, [authenticatedUser]);

	const sendMessage = (e: any, message: string) => {
		setNewMessage("");
		sendMessageEv(e, message);
	};

	return (
		<div className="mt-10 row-span-3">
			<section aria-labelledby="activity-title" className="mt-8 xl:mt-10">
				<div>
					<div className="divide-y divide-gray-200">
						<div className="pb-4">
							<h2
								id="activity-title"
								className="text-lg font-medium text-gray-900"
							>
								Activity
							</h2>
						</div>
						<div className="pt-6">
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
													<>
														<div className="relative">
															<img
																className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
																src={
																	item.imageUrl
																}
																alt=""
															/>

															<span className="absolute -bottom-0.5 -right-1 bg-signalBlue-1 rounded-tl px-0.5 py-px">
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
																	{item.date.toLocaleDateString(
																		"en-gb",
																		{
																			year: "numeric",
																			month: "long",
																			day: "numeric",
																		}
																	)}
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
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>

							{authenicated ? (
								<div className="mt-6">
									<div className="flex space-x-3">
										<div className="flex-shrink-0">
											<div className="relative">
												<img
													className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white"
													src="https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png"
													alt=""
												/>

												<span className="absolute -bottom-0.5 -right-1 bg-signalBlue-1 rounded-tl px-0.5 py-px">
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
							) : (
								<div className="pt-5">
									<p className="text-lg text-gray-500">
										To leave messages or add new signals you
										need to be logged in.
									</p>

									<div className="mt-10 row-span-3">
										<button
											type="button"
											className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-signalBlue-200 hover:bg-signalBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-signalBlue-500"
											onClick={login}
										>
											Login
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
