import { PencilAltIcon } from "@heroicons/react/outline";
import { useContext, useEffect, useState } from "react";
import CreateProposal from "../components/CreateProposal";
import ProposalList from "../components/ProposalList";
import SystemParams from "../components/SystemParams";
import { DaoContext } from "../context/dao";
import { UserContext } from "../context/user";

export default function Profile() {
	const { authenticatedUser, authenticatedActor, login, user } =
		useContext(UserContext);

	const [accountBalance, setAccountBalance] = useState<String>();
	const [showLogin, setShowLogin] = useState(true);
	const [username, setUserName] = useState("");

	useEffect(() => {
		if (authenticatedUser && !authenticatedUser?.isAnonymous()) {
			checkBalance();
			setShowLogin(false);
		}
	}, [authenticatedUser]);

	const updateUsername = async (e: any) => {
		e.preventDefault();
		if (user) {
			await authenticatedActor?.update_user({
				name: username,
				profile_pic_url: user?.profile_pic_url,
			});
		}
	};

	const checkBalance = async () => {
		const accountBalance = await authenticatedActor?.account_balance();
		setAccountBalance(accountBalance?.amount.toString());
	};

	return (
		<>
			{showLogin ? (
				<>
					<div
						className={`min-w-0 flex-1 h-full flex flex-col overflow-y-auto lg:order-last p-8`}
					>
						<div className="bg-white shadow  sm:rounded-lg">
							<div className="px-4 py-5 sm:px-6">
								<h4 className="text-lg leading-6 font-medium text-gray-900">
									Profile
								</h4>

								<p className="mt-1 max-w-2xl text-sm text-gray-500">
									It looks like you're not signed in. Click
									the login button below to see your profile
									information as well as the state of the
									Signals DAO system.
								</p>
								<div className="p-8">
									<button
										type="submit"
										className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
										onClick={login}
									>
										Login
									</button>
								</div>
							</div>
						</div>
					</div>
				</>
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
										<div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											<form
												onSubmit={(e) =>
													updateUsername(e)
												}
											>
												<div className="mt-1 relative rounded-md shadow-sm">
													<input
														type="text"
														name="username"
														id="username"
														className="focus:ring-signalBlue-500 focus:border-signalBlue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
														placeholder={user?.name}
														onChange={(e) =>
															setUserName(
																e.target.value
															)
														}
													/>
													<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
														<button
															type="submit"
															className=""
														>
															<PencilAltIcon
																className="h-5 w-5 text-gray-500"
																aria-hidden="true"
															/>
														</button>
													</div>
												</div>
											</form>
										</div>
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
						<CreateProposal />
						<ProposalList />
					</div>
				</>
			)}
		</>
	);
}
