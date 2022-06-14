import { CreationState } from "../context/new-pin";

export const defaultSteps = [
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

export const defaultLocation = {
	coords: {
		latitude: 51.508039,
		longitude: -0.128069,
	},
	timestamp: Date.now(),
};