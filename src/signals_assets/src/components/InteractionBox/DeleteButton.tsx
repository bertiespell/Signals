import {
	ThumbDownIcon as ThumbDownIconSolid,
	ThumbUpIcon as ThumbUpIconSolid,
	TrashIcon,
} from "@heroicons/react/solid";
import { Tooltip } from "flowbite-react";

const DeleteButton = ({ deleteSignal }: { deleteSignal: any }) => {
	return (
		<div
			className="flex flex-row-reverse items-center p-2"
			style={{ flexDirection: "row-reverse" }}
		>
			<Tooltip content="Click here to delete your signal. This action cannot be undone.">
				<button
					className="flex items-center"
					onClick={() => deleteSignal()}
				>
					<TrashIcon className="h-8 w-8 " style={{ color: "grey" }} />{" "}
				</button>
			</Tooltip>
		</div>
	);
};

export default DeleteButton;
