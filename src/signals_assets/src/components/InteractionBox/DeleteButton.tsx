import {
	ThumbDownIcon as ThumbDownIconSolid,
	ThumbUpIcon as ThumbUpIconSolid,
	TrashIcon,
} from "@heroicons/react/solid";

const DeleteButton = ({ deleteSignal }: { deleteSignal: any }) => {
	return (
		<div
			className="flex flex-row-reverse items-center"
			style={{ flexDirection: "row-reverse" }}
		>
			<button
				className="flex items-center"
				onClick={() => deleteSignal()}
			>
				<TrashIcon className="h-8 w-8 " style={{ color: "red" }} />{" "}
				Delete
			</button>{" "}
		</div>
	);
};

export default DeleteButton;
