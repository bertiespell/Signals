import { IDL } from "@dfinity/candid";
import { useContext, useEffect, useState } from "react";
import SystemParams from "../components/SystemParams";
import { DaoContext } from "../context/dao";
import { UserContext } from "../context/user";

export default function Profile() {
	const { proposals } = useContext(DaoContext);

	const { authenticatedUser, authenticatedActor } = useContext(UserContext);

	const [accountBalance, setAccountBalance] = useState<String>();
	const [showLogin, setShowLogin] = useState(true);

	const updateUsername = async () => {};

	const checkBalance = async () => {
		const accountBalance = await authenticatedActor?.account_balance();
		setAccountBalance(accountBalance?.amount.toString());
	};
	useEffect(() => {
		if (!authenticatedUser || authenticatedUser?.isAnonymous()) {
			console.log("show login");
			setShowLogin(false);
		}
		checkBalance();
	});

	useEffect(() => {
		try {
			// proposals[0].payload.message
			// const decoded = IDL.decode(proposals[0].payload as any);
			if (proposals) {
				// console.log(proposals);
				// console.log(proposals[0].payload.message, "hererere");
				// console.log(proposals[0].payload.method);
				// console.log(proposals[0].payload.canister_id);
				// console.log(
				// 	IDL.decode(
				// 		[
				// 			IDL.Record({
				// 				["tokens_received_for_signal_creation"]:
				// 					IDL.Opt(
				// 						IDL.Record({ ["amount"]: IDL.Nat64 })
				// 					),
				// 			}),
				// 		],
				// 		proposals[0].payload.message
				// 			.toString()
				// 			.split(",")
				// 			.map((value) => Number(value)) as any
				// 	)
				// );
			}
		} catch (e) {
			// console.log(e);
		}
	}, [proposals]);

	return (
		<>
			{showLogin ? (
				"yes"
			) : (
				<>
					<div
						className={`min-w-0 flex-1 h-full flex flex-col overflow-y-auto lg:order-last p-8`}
					>
						<div className="bg-white shadow  sm:rounded-lg">
							<div className="px-4 py-5 sm:px-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Profile
								</h3>
								<p className="mt-1 max-w-2xl text-sm text-gray-500">
									View your username and token balances here.
								</p>
							</div>
							<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
								<dl className="sm:divide-y sm:divide-gray-200">
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
										<dt className="text-sm font-medium text-gray-500">
											Principle
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{authenticatedUser?.toString()}
										</dd>
									</div>
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
										<dt className="text-sm font-medium text-gray-500">
											Username
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											Give me a great username
										</dd>
									</div>

									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
										<dt className="text-sm font-medium text-gray-500">
											Signal Tokens
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{accountBalance}
										</dd>
									</div>
								</dl>
							</div>
						</div>
						<SystemParams />
						<div className="bg-white shadow  sm:rounded-lg mt-10">
							<div className="px-4 py-5 sm:px-6">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Proposals
								</h3>
								<p className="mt-1 max-w-2xl text-sm text-gray-500">
									View, create or vote on proposals for the
									Signals application.
								</p>
							</div>
							<div className="border-t border-gray-200 px-4 py-5 sm:p-0"></div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
