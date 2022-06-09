// export type EventSignal = {
//     date: string;
//     title: string;
//     description: string;
// }
// import Datepicker from "flowbite-datepicker/Datepicker";

import { useContext, useState } from "react";
import { MapContext } from "../../context/map";

export default function EventForm() {
	const { sendSignal } = useContext(MapContext);

	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy = today.getFullYear();

	const todaysDate = yyyy + "-" + mm + "-" + dd;
	const [date, setDate] = useState(todaysDate);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	return (
		<form>
			<div className="p-5 pt-20 mt-8 lg:mt-0">
				<h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
					Create a signal
				</h2>
				<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
					Add an Event
				</h3>
				<div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
					<p className="text-lg text-gray-500">
						Fill in a few details about your event so that we can
						send your signal to the network.
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
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
							className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
							placeholder="Add some details about your event..."
						/>
					</div>
				</div>

				<div className="mt-6 flex items-center justify-end space-x-4">
					<button
						type="submit"
						className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
						onClick={(e) =>
							sendSignal(e, { title, description, date })
						}
					>
						Send Signal
					</button>
				</div>
			</div>
		</form>
	);
}
