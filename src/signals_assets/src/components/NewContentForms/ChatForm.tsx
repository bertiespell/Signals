import { useContext, useState } from "react";

import { MapContext } from "../../context/map";
import ErrorAlert from "../ErrorAlert";

export default function ChatForm() {
	const { sendSignal } = useContext(MapContext);
	const [contents, setContents] = useState("");
	const [title, setTitle] = useState("");
	const [open, setOpen] = useState(false);

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
			<section aria-labelledby="activity-title" className="mt-5 xl:mt-10">
				<div>
					<div className="divide-y divide-gray-200">
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
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-signalBlue-500 focus:border-signalBlue-500 sm:text-sm"
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
													setContents(e.target.value)
												}
												className="shadow-sm focus:ring-signalBlue-500 focus:border-signalBlue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
												placeholder="Leave a first message for everyone"
											/>
										</div>
									</div>
									<div className="mt-6 flex items-center justify-end space-x-4">
										<button
											type="submit"
											className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
											onClick={(e) => {
												e.preventDefault();
												if (title && contents) {
													sendSignal(e as any, {
														title,
														contents,
													});
												} else {
													setOpen(true);
												}
											}}
										>
											Send Signal
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
				<ErrorAlert
					setOpen={setOpen}
					open={open}
					title={"Error"}
					message={"You need to fill in all the details to continue."}
				/>
			</section>
		</div>
	);
}
