import {
	ThumbDownIcon,
	ThumbUpIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import * as Flowbite from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import {
	ThumbDownIcon as ThumbDownIconSolid,
	ThumbUpIcon as ThumbUpIconSolid,
} from "@heroicons/react/solid";
import { UserContext } from "../../context/user";
import { MapContext } from "../../context/map";
import { Principal } from "@dfinity/principal";
import { ActiveContent } from "../../utils/types";

const Rating = ({ signal }: { signal: ActiveContent<any> }) => {
	const { activeContent, setKnownSignals } = useContext(MapContext);
	const { authenticatedActor, authenticatedUser } = useContext(UserContext);

	const [alreadyVoted, setAlreadyVoted] = useState(true);

	useEffect(() => {
		userCanRate();
	}, [authenticatedActor, activeContent]);

	const userCanRate = async () => {
		const canRate = await authenticatedActor?.principal_can_rate_signal(
			authenticatedUser as Principal,
			BigInt(activeContent?.signalMetadata?.id as number)
		);

		setAlreadyVoted(!canRate);
	};

	const submitRating = async (positive: boolean) => {
		await authenticatedActor?.leave_rating(
			BigInt(signal.signalMetadata?.id as number),
			positive
		);
		setAlreadyVoted(true);
		setKnownSignals();
	};

	return (
		<div
			className="flex flex-row-reverse items-center p-2"
			style={{ flexDirection: "row-reverse" }}
		>
			<Flowbite.Tooltip content="You'll be rewarded in Signals Token for maintaining the quality of data. You can only vote once per signal, and currently this action cannot be undone.">
				<QuestionMarkCircleIcon
					className="h-8 w85 text-gray-400"
					style={{ paddingRight: "5px" }}
				/>
			</Flowbite.Tooltip>
			{alreadyVoted ? (
				<>
					<>
						<button
							disabled={true}
							className="flex items-center cursor-not-allowed"
							onClick={() => submitRating(false)}
						>
							<ThumbDownIconSolid
								className="h-8 w-8 "
								style={{ color: "grey" }}
							/>{" "}
						</button>{" "}
						<button
							disabled={true}
							className="flex items-center  cursor-not-allowed"
							onClick={() => submitRating(true)}
						>
							<ThumbUpIconSolid
								className="h-8 w-8"
								style={{ color: "grey" }}
							/>{" "}
						</button>
					</>
				</>
			) : (
				<>
					<button
						className="flex items-center"
						onClick={() => submitRating(false)}
					>
						<ThumbDownIcon
							className="h-8 w-8 "
							style={{ color: "red" }}
						/>{" "}
					</button>{" "}
					<button
						className="flex items-center"
						onClick={() => submitRating(true)}
					>
						<ThumbUpIcon
							className="h-8 w-8"
							style={{ color: "green" }}
						/>{" "}
					</button>
				</>
			)}
		</div>
	);
};

export default Rating;
