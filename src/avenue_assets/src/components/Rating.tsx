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
import { UserContext } from "../context/user";
import { ActiveContent } from "../context/map";
import { Principal } from "@dfinity/principal";
const Rating = ({ signal }: { signal: ActiveContent<any> }) => {
	const { authenticatedActor, authenticatedUser } = useContext(UserContext);

	const [alreadyVoted, setAlreadyVoted] = useState(true);

	const userCanRate = async () => {
		const canRate = await authenticatedActor?.principal_can_rate_location(
			authenticatedUser as Principal,
			{
				lat: signal.signalMetadata?.location.lat as number,
				long: signal.signalMetadata?.location.long as number,
			}
		);

		setAlreadyVoted(!canRate);
	};

	useEffect(() => {
		userCanRate();
	}, [authenticatedActor]);

	const submitRating = async (positive: boolean) => {
		await authenticatedActor?.leave_rating(
			{
				lat: signal.signalMetadata?.location.lat as number,
				long: signal.signalMetadata?.location.long as number,
			},
			positive
		);
		setAlreadyVoted(true);
	};
	return (
		<div
			className="flex flex-row-reverse items-center"
			style={{ flexDirection: "row-reverse" }}
		>
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
							Dislike
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
							Like
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
						Dislike
					</button>{" "}
					<button
						className="flex items-center"
						onClick={() => submitRating(true)}
					>
						<ThumbUpIcon
							className="h-8 w-8"
							style={{ color: "green" }}
						/>{" "}
						Like
					</button>
				</>
			)}
			<Flowbite.Tooltip content="You'll be rewarded in Signals Token for maintaining the quality of data. You can only vote once per signal, and currently this action cannot be undone.">
				<QuestionMarkCircleIcon
					className="h-8 w85 text-gray-400"
					style={{ paddingRight: "5px" }}
				/>
			</Flowbite.Tooltip>
		</div>
	);
};

export default Rating;
