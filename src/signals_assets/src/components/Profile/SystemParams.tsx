import { useContext } from "react";
import * as Flowbite from "flowbite-react";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import { v4 as uuidv4 } from "uuid";

import { SystemParams } from "../../../../declarations/signals/signals.did";
import { SystemContext } from "../../context/system";
import LoadingSpinner from "../Spinner";

export default function SystemParams() {
	const { loadingSystemData, displayData } = useContext(SystemContext);

	return (
		<div className="bg-white shadow sm:rounded-lg mt-10">
			<div className="px-4 pt-5 sm:px-6">
				<h3 className="text-lg leading-6 font-medium text-gray-900">
					Signals System
				</h3>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					View the current system configuration
				</p>
			</div>
			{loadingSystemData ? (
				<LoadingSpinner />
			) : (
				<div className="p-5">
					<dl className="my-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
						{displayData?.map((item) => (
							<div
								key={uuidv4()}
								className="px-4 py-5 bg-white shadow rounded-lg sm:p-6"
								style={{ margin: "10px" }}
							>
								<dt className="text-sm font-medium text-gray-500 truncate flex">
									{item.name}
									<Flowbite.Tooltip content={item.tip}>
										<QuestionMarkCircleIcon
											className="h-5 w85 text-gray-400"
											style={{ paddingLeft: "5px" }}
										/>
									</Flowbite.Tooltip>
								</dt>
								<dd className="mt-1 text-3xl font-semibold text-gray-900">
									{item.stat}
								</dd>
							</div>
						))}
					</dl>
				</div>
			)}
		</div>
	);
}
