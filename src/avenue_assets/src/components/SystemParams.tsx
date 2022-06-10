import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import * as Flowbite from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import { SystemParams } from "../../../declarations/rust_avenue/rust_avenue.did";
import { UserContext } from "../context/user";
import { v4 as uuidv4 } from "uuid";
import { SystemContext } from "../context/system";

type DisplayData = {
	name: String;
	stat: String;
	tip: String;
};

const systemDataMapper = {
	downvotes_required_before_delete: {
		name: "Downvotes Deletion Threshold",
		tip: "The number of downvotes required before a signal is deleted",
	},
	proposal_submission_deposit: {
		name: "Proposal Deposit",
		tip: "The deposit required for submitting a proposal",
	},
	proposal_vote_threshold: {
		name: "Vote Threshold",
		tip: "The threshold number of votes required for a proposal to pass",
	},
	tokens_received_for_signal_creation: {
		name: "Signal Creation Tokens",
		stat: "71,897",
		tip: "The amount of tokens received for creating a signal",
	},
	tokens_received_for_upvoted_signal: {
		name: "Upvote Tokens",
		stat: "58.16%",
		tip: "The amount of tokens a user receives after meeting the required number of upvotes",
	},
	transfer_fee: {
		name: "Transfer",
		tip: "The fee for transfering Signals Token",
	},
	upvotes_required_before_token_minting: {
		name: "Upvotes Token Threshold",
		tip: "The number of upvotes required before a token reward is distributed",
	},
};

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
				<div className="flex justify-center items-center p-10">
					<div
						className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"
						role="status"
					>
						<svg
							role="status"
							className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
							viewBox="0 0 100 101"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
								fill="currentColor"
							/>
							<path
								d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
								fill="currentFill"
							/>
						</svg>
					</div>
				</div>
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
