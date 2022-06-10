import { Principal } from "@dfinity/principal";
import { Marker } from "leaflet";
import { SignalType as RustSignalType } from "../../../declarations/rust_avenue/rust_avenue.did";

import {
	EventSignal,

	PinType,
	Trade,
	Chat,
	SignalType,
} from "./mapSignalTypes";

export type MapContextType<T extends SignalType> = {
	pinType: PinType;
	activeContent: ActiveContent<T> | undefined;
	newPinContent: ActiveContent<T> | undefined;
	setActiveContent: any;
	setPinType: any;
	sendSignal: (
		e: Event,
		contents: EventSignal | Trade | Chat
	) => Promise<void>;
	allSignals: Array<ActiveContent<T>>;
	map: any;
	sendMessage: (
		activeContent: ActiveContent<SignalType>,
		message: string
	) => Promise<void>;
	createNewActivePin: any;
	setRefReady: () => void;
};

export type Message = {
	contents: string;
	identity: string;
	time: string;
};

export type Signal<T extends SignalType> = {
	created_at: string;
	updated_at: string;
	id: number;
	metadata: T;
	user: Principal;
	messages: Array<Message>;
	location: {
		lat: number;
		long: number;
	};
	signal_type: RustSignalType;
};

export type ActiveContent<T extends SignalType> = {
	id: string;
	marker: Marker;
	signalMetadata: Signal<T> | null;
	isNewPin: boolean;
};
