import React, { useContext, useEffect, useState } from "react";
import { SystemParams } from "../../../declarations/signals/signals.did";
import { UserContext } from "./user";

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

export const SystemContext = React.createContext<{
	loadingSystemData: boolean;
	displayData: Array<DisplayData>;
	getSystemParams: any;
	systemParams: SystemParams | undefined;
}>({} as any);

const SystemProvider = ({ children }: any) => {
	const { authenticatedActor } = useContext(UserContext);

	const [displayData, setDisplayData] = useState<Array<DisplayData>>([]);
	const [systemParams, setSystemParams] = useState<SystemParams>();

	const [loadingSystemData, setLoadingSystemData] = useState(true);

	useEffect(() => {
		getSystemParams();
	}, [authenticatedActor]);

	const mapSystemParamsToDisplayData = (
		systemParams: SystemParams
	): Array<DisplayData> => {
		const displayData: Array<DisplayData> = [];
		Object.keys(systemParams).map((paramVariable) => {
			displayData.push({
				name: ((systemDataMapper as any)[paramVariable] as any).name,
				stat: (systemParams as any)[paramVariable].amount.toString(),
				tip: (systemDataMapper as any)[paramVariable].tip,
			});
		});

		return displayData;
	};

	const getSystemParams = async () => {
		if (authenticatedActor) {
			const systemParams = await authenticatedActor?.get_system_params();
			if (systemParams) {
				const displayData = mapSystemParamsToDisplayData(systemParams);
				setDisplayData(displayData);
				setLoadingSystemData(false);
				setSystemParams(systemParams);
			}
		}
	};

	return (
		<SystemContext.Provider
			value={{
				loadingSystemData,
				displayData,
				getSystemParams,
				systemParams,
			}}
		>
			{children}
		</SystemContext.Provider>
	);
};

export default SystemProvider;
