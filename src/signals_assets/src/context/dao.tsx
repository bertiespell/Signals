import { IDL } from "@dfinity/candid";
import { encode } from "@dfinity/candid/lib/cjs/idl";
import { Principal } from "@dfinity/principal";
import React, { useContext, useEffect, useState } from "react";
import { canisterId } from "../../../declarations/signals";
import {
	Proposal,
	Signal,
	SubmitProposalResult,
	Tokens,
} from "../../../declarations/signals/signals.did";
import { SystemContext } from "./system";
import { UserContext } from "./user";

export type DaoContextType = {
	userSignals: Array<Signal> | undefined;
	proposals: Array<Proposal> | undefined;
	accountBalance: Tokens | undefined;
	makeProposal: (
		proposed_change: string,
		proposed_amount: number
	) => Promise<SubmitProposalResult | undefined>;
	voteProposal:
		| ((proposal_id: bigint, inFavour: boolean) => Promise<void>)
		| undefined;
	fetchProposals: () => Promise<void>;
};

export const DaoContext = React.createContext<DaoContextType>({} as any);

const DaoProvider = ({ children }: any) => {
	const { authenticatedActor } = useContext(UserContext);
	const { getSystemParams } = useContext(SystemContext);

	const [userSignals, setUserSignals] = useState<Array<Signal>>([]);
	const [proposals, setProposals] = useState<Array<Proposal>>();
	const [accountBalance, setAccountBalance] = useState<Tokens>();

	const makeProposal = async (
		proposed_change: string,
		proposed_amount: number
	): Promise<SubmitProposalResult | undefined> => {
		const proposal_for_signal_tokens = () => {
			return encode(
				[
					IDL.Record({
						[proposed_change]: IDL.Opt(
							IDL.Record({
								["amount"]: IDL.Nat64,
							})
						),
					}),
				],
				[
					{
						[proposed_change]: [{ ["amount"]: proposed_amount }],
					},
				]
			);
		};
		if (authenticatedActor) {
			return await authenticatedActor.submit_proposal({
				canister_id: Principal.fromText(canisterId as string),
				method: "update_system_params",
				metadata: proposed_change,
				message: proposal_for_signal_tokens()
					.toString()
					.split(",")
					.map((value) => Number(value)),
			});
		}
	};

	const voteProposal = async (proposal_id: bigint, inFavour: boolean) => {
		const vote = inFavour ? { Yes: null } : { No: null };
		await authenticatedActor?.vote({
			vote,
			proposal_id,
		});
		fetchProposals();
		getSystemParams();
	};

	const fetchProposals = async () => {
		try {
			if (authenticatedActor) {
				const proposals = await authenticatedActor.list_proposals();
				setProposals(proposals);
			}
		} catch {}
	};

	const daoInit = async () => {
		if (authenticatedActor) {
			const whoami = await authenticatedActor.whoami();
			const accountBalance = await authenticatedActor.account_balance();
			setAccountBalance(accountBalance);
			fetchProposals();

			const userSignals = await authenticatedActor.get_signals_for_user(
				whoami
			);
			setUserSignals(userSignals);
		}
	};

	useEffect(() => {
		daoInit();
	}, [authenticatedActor]);

	return (
		<DaoContext.Provider
			value={{
				userSignals,
				proposals,
				accountBalance,
				makeProposal,
				voteProposal,
				fetchProposals,
			}}
		>
			{children}
		</DaoContext.Provider>
	);
};

export default DaoProvider;
