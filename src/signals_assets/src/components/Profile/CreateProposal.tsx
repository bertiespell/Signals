import { useContext, useEffect, useState } from "react";
import { DaoContext } from "../../context/dao";
import { SystemContext } from "../../context/system";
import ErrorAlert from "../ErrorAlert";
import LoadingSpinner from "../Spinner";
import SuccessAlert from "../SuccessAlert";

export default function CreateProposal() {
	const { makeProposal, fetchProposals } = useContext(DaoContext);

	const { systemParams } = useContext(SystemContext);

	const [loading, setLoading] = useState(true);
	const [contents, setContents] = useState("");
	const [amount, setAmount] = useState("");
	const [open, setOpen] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessge] = useState("");

	useEffect(() => {
		if (systemParams) {
			setLoading(false);
			setContents(Object.keys(systemParams as any)[0]);
		}
	}, [systemParams]);

	const createProposal = async (e: any) => {
		e.preventDefault();
		if (contents && amount && makeProposal) {
			const proposal = await makeProposal(contents, Number(amount));
			if ((proposal as any).Err) {
				setErrorOpen(true);
				setErrorMessge(
					`Your proposal couldn't be created. The canister returned: ` +
						(proposal as any).Err
				);
			} else {
				setErrorOpen(false);
				setAmount("");
				setContents("");
				await fetchProposals();
				setOpen(true);
			}
		}
	};

	return (
		<>
			<div className="bg-white shadow  sm:rounded-lg mt-10">
				<div className="px-4 py-5 sm:px-6">
					<h3 className="text-lg leading-6 font-medium text-gray-900">
						Create Proposal
					</h3>
					<p className="mt-1 max-w-2xl text-sm text-gray-500">
						Submit a proposal to the Signals DAO. Note this can also
						be done programmatically for more sophisticated
						proposals. Here an interface is provided with the most
						commonly configured aspects.
					</p>
				</div>
				{loading ? (
					<LoadingSpinner />
				) : (
					<div className="px-4 py-5 sm:p-0">
						<div className="">
							<div className="min-w-0 flex-1">
								<div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5 p-10">
									<div className="space-y-6 sm:space-y-5">
										<div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
											<label
												htmlFor="country"
												className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
											>
												System Param
											</label>
											<div className="mt-1 sm:mt-0 sm:col-span-2">
												<select
													id="systemparam"
													name="systemparam"
													className="max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
													value={contents}
													onChange={(e) =>
														setContents(
															e.target.value
														)
													}
												>
													{systemParams &&
														Object.keys(
															systemParams as any
														).map((key, index) => {
															return (
																<option
																	key={index}
																>
																	{key}
																</option>
															);
														})}
												</select>
											</div>
										</div>
										<div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
											<label
												htmlFor="amount"
												className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
											>
												Amount
											</label>
											<div className="mt-1 sm:mt-0 sm:col-span-2">
												<input
													type="text"
													name="amount"
													id="amount"
													className="max-w-lg block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
													value={amount}
													onChange={(e) =>
														setAmount(
															e.target.value
														)
													}
												/>
											</div>
										</div>
										<div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5 flex items-center justify-center ">
											<div className="mt-1 sm:mt-0 sm:col-span-3 flex justify-center  pl-5">
												<button
													type="submit"
													className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
													onClick={(e) =>
														createProposal(e as any)
													}
												>
													Create
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
			<div>
				<SuccessAlert
					setOpen={setOpen}
					open={open}
					title={"Success"}
					message={
						"Your proposal was created, return to your profile to see it in the prosoals list."
					}
				/>
				<ErrorAlert
					setOpen={setErrorOpen}
					open={errorOpen}
					title={"Error"}
					message={errorMessage}
				/>
			</div>
		</>
	);
}
