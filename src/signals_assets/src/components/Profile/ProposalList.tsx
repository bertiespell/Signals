import { useContext, useEffect, useState } from "react";
import { IDL } from "@dfinity/candid";
import { v4 as uuidv4 } from "uuid";
import { XIcon } from "@heroicons/react/solid";
import { CheckIcon } from "@heroicons/react/outline";

import { Proposal } from "../../../../declarations/signals/signals.did";
import { DaoContext } from "../../context/dao";
import { UserContext } from "../../context/user";
import { getProposalState, proposalIsOpen } from "../../utils/mapProposals";
import SuccessAlert from "../SuccessAlert";
import LoadingSpinner from "../Spinner";

interface ProposalDisplayData extends Proposal {
	decodedAmount: string;
}

export default function ProposalList() {
	const { proposals, voteProposal } = useContext(DaoContext);
	const { authenticatedUser } = useContext(UserContext);

	const [displayData, setDisplayData] =
		useState<Array<ProposalDisplayData>>();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (proposals) {
			decodeProposals(proposals);
		}
	}, [proposals]);

	const decodeProposals = async (proposals: Array<Proposal>) => {
		const proposalDisplayData: Array<ProposalDisplayData> = [];
		proposals.map((proposal) => {
			try {
				const decoded = IDL.decode(
					[
						IDL.Record({
							[proposal.payload.metadata]: IDL.Opt(
								IDL.Record({ ["amount"]: IDL.Nat64 })
							),
						}),
					],
					proposal.payload.message
						.toString()
						.split(",")
						.map((value) => Number(value)) as any
				);

				proposalDisplayData.push({
					decodedAmount: (decoded as any)[0][
						proposal.payload.metadata
					][0]["amount"].toString(),
					...proposal,
				});
			} catch {}
		});
		proposalDisplayData.sort(
			(proposalA, proposalB) =>
				Number(proposalB.timestamp) - Number(proposalA.timestamp)
		);

		setDisplayData(proposalDisplayData);
	};

	const vote = (proposalId: bigint, inFavour: boolean) => {
		voteProposal && voteProposal(proposalId, inFavour);
		setOpen(true);
	};

	return (
		<div className="bg-white shadow  sm:rounded-lg mt-10">
			<div className="px-4 py-5 sm:px-6">
				<h3 className="text-lg leading-6 font-medium text-gray-900">
					Proposals
				</h3>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">
					View, create or vote on proposals for the Signals
					application.
				</p>
			</div>
			{proposals ? (
				<div className="px-4 py-5 sm:p-0">
					<div className="p-5">
						<ul
							role="list"
							className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
						>
							{displayData?.map((proposal) => (
								<li
									key={uuidv4()}
									className="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200"
								>
									<div className="w-full flex items-center justify-between p-6 space-x-6">
										<div className="flex-1 truncate">
											<div className="flex items-center space-x-3">
												<h3 className="text-gray-900 text-sm font-medium truncate">
													ID: {proposal.id.toString()}
												</h3>
											</div>
											<p className="mt-1 text-gray-500 text-sm truncate">
												Change:
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												<b>
													<code>{`${proposal.payload.metadata}`}</code>
												</b>
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												To new amount:
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												<b>{proposal.decodedAmount}</b>
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												Proposed by:
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												{proposal.proposer.toString()}
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												On:
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												{new Date(
													Number(
														proposal.timestamp
															.toString()
															.slice(0, 10)
													) * 1000
												).toString()}
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												No votes:{" "}
												{proposal.votes_no.amount.toString()}
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												Yes votes:{" "}
												{proposal.votes_yes.amount.toString()}
											</p>
											<p className="mt-1 text-gray-500 text-sm truncate">
												Proposal State:{" "}
												{getProposalState(proposal)}
											</p>
										</div>
									</div>
									<div>
										<div>
											{proposalIsOpen(proposal) ? (
												<>
													<>
														{proposal.voters.filter(
															(voter) =>
																voter.toString() ===
																authenticatedUser?.toString()
														).length ? (
															<div className="-mt-px flex divide-x divide-gray-200">
																<div className="w-0 flex-1 flex">
																	<p className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500">
																		You've
																		already
																		voted.
																	</p>
																</div>
															</div>
														) : (
															<div className="-mt-px flex divide-x divide-gray-200">
																<div className="w-0 flex-1 flex">
																	<button
																		className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
																		onClick={() =>
																			vote(
																				proposal.id,
																				true
																			)
																		}
																	>
																		<CheckIcon
																			className="w-5 h-5 text-green-500"
																			aria-hidden="true"
																		/>
																		<span className="ml-3">
																			Vote
																			Yes
																		</span>
																	</button>
																</div>
																<div className="-ml-px w-0 flex-1 flex">
																	<button
																		className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500"
																		onClick={() =>
																			vote(
																				proposal.id,
																				false
																			)
																		}
																	>
																		<XIcon
																			className="w-5 h-5 text-red-500"
																			aria-hidden="true"
																		/>
																		<span className="ml-3">
																			Vote
																			No
																		</span>
																	</button>
																</div>
															</div>
														)}
													</>
												</>
											) : (
												<>
													<div className="-mt-px flex divide-x divide-gray-200">
														<div className="w-0 flex-1 flex">
															<p className="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm text-gray-700 font-medium border border-transparent rounded-bl-lg hover:text-gray-500">
																Voting is
																closed.
															</p>
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
				</div>
			) : (
				<LoadingSpinner />
			)}
			<SuccessAlert
				setOpen={setOpen}
				open={open}
				title={"Success"}
				message={"Your vote was registered on the blockchain."}
			/>
		</div>
	);
}
