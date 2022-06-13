import { useContext, useState } from "react";

import { ChatAltIcon } from "@heroicons/react/solid";
import { MapContext } from "../../../context/map";

export default function PinContent() {
	const { sendSignal } = useContext(MapContext);
	const [contents, setContents] = useState("");

	return (
		<div className="p-5 pt-20 mt-8 lg:mt-0">
			<h2 className="text-base text-signalBlue-600 font-semibold tracking-wide uppercase">
				Create a chat
			</h2>
			<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
				Add a Message
			</h3>
			<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
				<p className="text-lg text-gray-500">
					Once you add a signal it will be available for everyone to
					view on the map. Other users will be able to interact with
					your signal and send further messages.
				</p>
			</div>
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
													placeholder="Add some content to start your signal."
													value={contents}
													onChange={(e) =>
														setContents(
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
														sendSignal(
															e as any,
															contents as any
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
	);
}
