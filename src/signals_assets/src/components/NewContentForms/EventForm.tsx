import { useContext, useState } from "react";
import { MapContext } from "../../context/map";
import ErrorAlert from "../ErrorAlert";

export default function EventForm() {
	const { sendSignal } = useContext(MapContext);

	const [open, setOpen] = useState(false);

	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy = today.getFullYear();

	const todaysDate = yyyy + "-" + mm + "-" + dd;
	const [date, setDate] = useState(todaysDate);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const [isTicketed, setIsTicketed] = useState(false);
	const [numberOfTickets, setNumberOfTickets] = useState("10");

	return (
		<form>
			<div className="p-5 pt-20 mt-8 lg:mt-0">
				<h2 className="text-base text-signalBlue-600 font-semibold tracking-wide uppercase">
					Create a signal
				</h2>
				<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
					Add an Event
				</h3>
				<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
					<p className="text-lg text-gray-500">
						Fill in a few details about your event.
					</p>
				</div>
				<div className="p-5 col-span-6 sm:col-span-3">
					<label
						htmlFor="event-title"
						className="block text-sm font-medium text-gray-700"
					>
						Event Title
					</label>
					<input
						type="text"
						name="event-title"
						id="event-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-signalBlue-500 focus:border-signalBlue-500 sm:text-sm"
					/>
				</div>
				<div className="p-5 col-span-6 sm:col-span-3">
					<input
						type="date"
						id="event-date"
						name="event-start"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						min="2022-05-01"
						max="2025-12-31"
					></input>
				</div>
				<div className="col-span-3 p-5 ">
					<label
						htmlFor="about"
						className="block text-sm font-medium text-gray-700"
					>
						Description
					</label>
					<div className="mt-1">
						<textarea
							id="about"
							name="about"
							rows={8}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="shadow-sm focus:ring-signalBlue-500 focus:border-signalBlue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
							placeholder="Add some details about your event..."
						/>
					</div>
				</div>
				<div className="col-span-3 p-2 ">
					<div className="relative flex items-start">
						<div className="flex items-center h-5">
							<input
								id="third-party"
								name="third-party"
								type="checkbox"
								className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
								onChange={(e) => setIsTicketed(!isTicketed)}
							/>
						</div>
						<div className="ml-3 text-sm">
							<label
								htmlFor="third-party"
								className="font-medium text-gray-700"
							>
								Ticketed Event
							</label>
							<p className="text-gray-500">
								Create a specific number of tickets for your
								event
							</p>
						</div>
					</div>{" "}
				</div>
				<div className="col-span-3 px-5 pb-5">
					<div
						className={`sm:col-span-7 ${
							isTicketed ? "" : "hidden"
						}`}
					>
						<div className="flex rounded-md shadow-sm">
							<span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
								Number of tickets
							</span>
							<input
								type="text"
								name="ticket-number"
								id="ticket-number"
								className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
								placeholder="10"
								value={numberOfTickets}
								onChange={(e) =>
									setNumberOfTickets(e.target.value)
								}
							/>
						</div>
					</div>
				</div>
				<div className="flex items-center justify-end space-x-4">
					<button
						type="submit"
						className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
						onClick={(e) => {
							e.preventDefault();
							if (title && description && date) {
								if (isTicketed) {
									sendSignal(
										e as any,
										{
											title,
											description,
											date,
											numberOfTickets,
										} as any
									);
								} else {
									sendSignal(e as any, {
										title,
										description,
										date,
									});
								}
							} else {
								setOpen(true);
							}
						}}
					>
						Send Signal
					</button>
				</div>
			</div>
			<ErrorAlert
				setOpen={setOpen}
				open={open}
				title={"Error"}
				message={"You need to fill in all the details to continue."}
			/>
		</form>
	);
}
