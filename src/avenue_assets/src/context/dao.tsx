import { GlobalInternetComputer } from "@dfinity/agent";
import { IDL } from "@dfinity/candid";
import { encode, Nat64 } from "@dfinity/candid/lib/cjs/idl";
import { Principal } from "@dfinity/principal";
import React from "react";
import { rust_avenue, canisterId } from "../../../declarations/rust_avenue";

export const DaoContext = React.createContext({});

const DaoProvider = ({ children }: any) => {
	const daoInit = async () => {
		const profile = {};
		const whoami = await rust_avenue.whoami();
		const account_balance = await rust_avenue.account_balance();
		const proposals = await rust_avenue.list_proposals();
		proposals.forEach((proposal) => {
			if (Object.keys(proposal.state)[0] === "Open") {
				console.log("proposal open lets vote!", proposal);
				rust_avenue.vote({
					vote: { Yes: null },
					proposal_id: proposal.id,
				});
			}
		});
		const signals = await rust_avenue.get_signals_for_user(whoami);

		const proposal_for_signal_tokens = () => {
			const proposed_change = "tokens_received_for_signal_creation";
			const proposed_change_arg = "amount";
			const proposed_amount = 15;

			return encode(
				[
					IDL.Record({
						[proposed_change]: IDL.Opt(
							IDL.Record({ [proposed_change_arg]: IDL.Nat64 })
						),
					}),
				],
				[
					{
						[proposed_change]: [
							{ [proposed_change_arg]: proposed_amount },
						],
					},
				]
			);
		};

		const proposal = await rust_avenue.submit_proposal({
			canister_id: Principal.fromText(canisterId as string),
			method: "update_system_params",
			message: proposal_for_signal_tokens()
				.toString()
				.split(",")
				.map((value) => Number(value)),
		});

		console.log(proposal);
	};

	daoInit();
	return <DaoContext.Provider value={{}}>{children}</DaoContext.Provider>;
};

export default DaoProvider;
