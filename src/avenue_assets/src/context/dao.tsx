import { IDL } from "@dfinity/candid";
import { encode } from "@dfinity/candid/lib/cjs/idl";
import { Principal } from "@dfinity/principal";
import React, { useEffect, useState } from "react";
import { rust_avenue, canisterId } from "../../../declarations/rust_avenue";
import {
	Proposal,
	Signal_2,
	SubmitProposalResult,
	Tokens,
} from "../../../declarations/rust_avenue/rust_avenue.did";

export type DaoContextType = {
	whoami: Principal | undefined;
	userSignals: Array<Signal_2> | undefined;
	proposals: Array<Proposal> | undefined;
	accountBalance: Tokens | undefined;
	makeProposal:
		| ((
				proposed_change: string,
				proposed_change_arg: string,
				proposed_amount: number
		  ) => Promise<SubmitProposalResult>)
		| undefined;
	voteProposal: ((proposal: Proposal) => Promise<void>) | undefined;
};

export const DaoContext = React.createContext<DaoContextType>({} as any);

const DaoProvider = ({ children }: any) => {
	const [whoami, setWhoami] = useState<Principal>();
	const [userSignals, setUserSignals] = useState<Array<Signal_2>>([]);
	const [proposals, setProposals] = useState<Array<Proposal>>();
	const [accountBalance, setAccountBalance] = useState<Tokens>();
	const [makeProposal, setMakeProposal] =
		useState<
			(
				proposed_change: string,
				proposed_change_arg: string,
				proposed_amount: number
			) => Promise<SubmitProposalResult>
		>();
	const [voteProposal, setVoteProposal] =
		useState<(proposal: Proposal) => Promise<void>>();

	const daoInit = async () => {
		const whoami = await rust_avenue.whoami();
		setWhoami(whoami);
		const accountBalance = await rust_avenue.account_balance();
		setAccountBalance(accountBalance);
		const proposals = await rust_avenue.list_proposals();
		setProposals(proposals);

		const voteProposal = async (proposal: Proposal) => {
			if (Object.keys(proposal.state)[0] === "Open") {
				await rust_avenue.vote({
					vote: { Yes: null },
					proposal_id: proposal.id,
				});
			}
		};
		setVoteProposal(voteProposal);

		const userSignals = await rust_avenue.get_signals_for_user(whoami);
		setUserSignals(userSignals);

		/**
		 * proposed_change: "tokens_received_for_signal_creation"
		 * proposed_change_arg: "amount"
		 * proposed_amount: 15
		 */
		const makeProposal = async (
			proposed_change: string,
			proposed_change_arg: string,
			proposed_amount: number
		): Promise<SubmitProposalResult> => {
			const proposal_for_signal_tokens = () => {
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

			return await rust_avenue.submit_proposal({
				canister_id: Principal.fromText(canisterId as string),
				method: "update_system_params",
				message: proposal_for_signal_tokens()
					.toString()
					.split(",")
					.map((value) => Number(value)),
			});
		};

		setMakeProposal(makeProposal);
	};

	useEffect(() => {
		daoInit();
	}, []);

	return (
		<DaoContext.Provider
			value={{
				whoami,
				userSignals,
				proposals,
				accountBalance,
				makeProposal,
				voteProposal,
			}}
		>
			{children}
		</DaoContext.Provider>
	);
};

export default DaoProvider;
