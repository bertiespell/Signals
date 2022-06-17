import { useContext, useState } from "react";
import { MapContext } from "../../context/map";
import ErrorAlert from "../ErrorAlert";

export default function TradeForm() {
	const { sendSignal } = useContext(MapContext);
	const [description, setDescription] = useState("");
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("0");
	const [open, setOpen] = useState(false);

	return (
		<>
			<form>
				<div className="p-5 pt-20 mt-8 lg:mt-0">
					<h2 className="text-base text-signalBlue-600 font-semibold tracking-wide uppercase">
						Create a signal
					</h2>
					<h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
						List item for trade
					</h3>
					<div className="mt-5 prose prose-signalBlue text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1 row-span-3">
						<p className="text-lg text-gray-500">
							Fill in a few details about your item.
						</p>
					</div>

					<div className="p-5 col-span-6 sm:col-span-3">
						<label
							htmlFor="item-title"
							className="block text-sm font-medium text-gray-700"
						>
							Title
						</label>
						<input
							type="text"
							name="item-title"
							id="item-title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-signalBlue-500 focus:border-signalBlue-500 sm:text-sm"
						/>
					</div>
					<div className="p-5 col-span-6 sm:col-span-3">
						<label
							htmlFor="item-price"
							className="block text-sm font-medium text-gray-700"
						>
							Price
						</label>
						<div className="mt-1 relative rounded-md shadow-sm">
							<input
								type="text"
								name="price"
								id="price"
								className="focus:ring-signalBlue-500 focus:border-signalBlue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
								placeholder="0.00"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
							/>
							<div className="absolute inset-y-0 right-0 flex items-center">
								<label htmlFor="currency" className="sr-only">
									Currency
								</label>
								<select
									id="currency"
									name="currency"
									className="focus:ring-signalBlue-500 focus:border-signalBlue-500 h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 sm:text-sm rounded-md"
								>
									<option>USD</option>
									<option>ICP</option>
								</select>
							</div>
						</div>
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
								placeholder="Add some details about your item..."
							/>
						</div>
					</div>

					<div className="mt-6 flex items-center justify-end space-x-4">
						<button
							type="submit"
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
							onClick={(e) => {
								e.preventDefault();
								if (title && description && Number(price)) {
									sendSignal(e as any, {
										title,
										description,
										price: Number(price).toString(),
									});
								} else {
									setOpen(true);
								}
							}}
						>
							Send Signal
						</button>
					</div>
				</div>
			</form>
			<ErrorAlert
				setOpen={setOpen}
				open={open}
				title={"Error"}
				message={"You need to fill in all the details to continue."}
			/>
		</>
	);
}
