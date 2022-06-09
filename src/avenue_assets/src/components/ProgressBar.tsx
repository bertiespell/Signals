import { CheckIcon } from "@heroicons/react/solid";
import { useEffect, useState } from "react";
import { CreationState } from "./InteractionBox";

function classNames(...classes: any) {
	return classes.filter(Boolean).join(" ");
}

export default function ProgressBar({
	setInteractionState,
	interactionState,
}: any) {
	const defaultSteps = [
		{
			stage: CreationState.Starting,
			href: "#",
			status: "current",
			name: "Step 1",
		},
		{
			stage: CreationState.TypeSelection,
			href: "#",
			status: "",
			name: "Step 2",
		},
		{
			stage: CreationState.AddContent,
			href: "#",
			status: "",
			name: "Step 3",
		},
	];
	const [steps, setSteps] = useState(defaultSteps);

	const onClick = (e: any, step: any, stepIdx: number) => {
		e.preventDefault();
		setInteractionState(step.stage);
	};

	useEffect(() => {
		const newSteps = steps.concat();
		let found = false;
		steps.forEach((step) => {
			if (interactionState == step.stage) {
				step.status = "current";
				found = true;
			} else {
				if (!found) {
					step.status = "complete";
				} else {
					step.status = "";
				}
			}
		});
		setSteps(newSteps);
	}, [interactionState]);

	return (
		<nav aria-label="Progress">
			<ol role="list" className="flex items-center justify-center">
				{steps.map((step, stepIdx) => (
					<li
						key={step.name}
						className={classNames(
							stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20" : "",
							"relative"
						)}
					>
						{step.status === "complete" ? (
							<>
								<div
									className="absolute inset-0 flex items-center"
									aria-hidden="true"
								>
									<div className="h-0.5 w-full bg-indigo-600" />
								</div>
								<button
									className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900"
									onClick={(e) => onClick(e, step, stepIdx)}
								>
									<CheckIcon
										className="w-5 h-5 text-white"
										aria-hidden="true"
									/>
									<span className="sr-only">{step.name}</span>
								</button>
							</>
						) : step.status === "current" ? (
							<>
								<div
									className="absolute inset-0 flex items-center"
									aria-hidden="true"
								>
									<div className="h-0.5 w-full bg-gray-200" />
								</div>
								<button
									className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full"
									aria-current="step"
									onClick={(e) => onClick(e, step, stepIdx)}
								>
									<span
										className="h-2.5 w-2.5 bg-indigo-600 rounded-full"
										aria-hidden="true"
									/>
									<span className="sr-only">{step.name}</span>
								</button>
							</>
						) : (
							<>
								<div
									className="absolute inset-0 flex items-center"
									aria-hidden="true"
								>
									<div className="h-0.5 w-full bg-gray-200" />
								</div>
								<button
									className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400"
									onClick={(e) => onClick(e, step, stepIdx)}
								>
									<span
										className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"
										aria-hidden="true"
									/>
									<span className="sr-only">{step.name}</span>
								</button>
							</>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
}
