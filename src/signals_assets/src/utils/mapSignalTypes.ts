import { ActiveContent } from "./types";

export type SignalPin<T> = {
    contents: T;
    identity: string;
    time: string;
}

export type SignalType = EventSignal | Chat | Trade;

export type EventSignal = {
    date: string;
    title: string;
    description: string;
    numberOfTickets?: number;
}

export type Chat = {
    title: string;
    contents: string;
}

export type Trade = {
    title: string;
    description: string;
    price: string;
}

export enum PinType {
	Chat = "chat",
	Trade = "trade",
	Event = "event",
}

export type SignalType_2 = { Trade: null } | { Chat: null } | { Event: null };

export const mapSignalToType = (pinType: PinType): SignalType_2 => {
    if (pinType === PinType.Chat) return { Chat: null };
    if (pinType === PinType.Trade) return { Trade: null };
    if (pinType === PinType.Event) return { Event: null };
    throw Error("Unknown signal type");
};

export const mapSignalTypeToIcon = (L: any, signalType: SignalType_2) => {

    var chatIcon = L.icon({
        iconUrl: "../../chat-five.png",
        iconSize: [40, 40],
        iconAnchor: [40, 40],
        popupAnchor: [-3, -76],
    });

    var eventIcon = L.icon({
        iconUrl: "../../event-two.png",
        iconSize: [40, 40],
        iconAnchor: [40, 40],
        popupAnchor: [-3, -76],
    });

    var tradeIcon = L.icon({
        iconUrl: "../../basket.png",
        iconSize: [40, 40],
        iconAnchor: [40, 40],
        popupAnchor: [-3, -76],
    });

    if (Object.keys(signalType)[0] === "Chat") return chatIcon;
    if (Object.keys(signalType)[0] === "Event") return eventIcon;
    if (Object.keys(signalType)[0] === "Trade") return tradeIcon;
    throw Error("Unknown signal type");
};

export const mapActiveContentToPinType = (activeContent: ActiveContent<SignalType>): PinType => {
    if (Object.keys(activeContent.signalMetadata?.signal_type as any)[0] === "Chat") return PinType.Chat;
    if (Object.keys(activeContent.signalMetadata?.signal_type as any)[0] === "Event") return PinType.Event;
    if (Object.keys(activeContent.signalMetadata?.signal_type as any)[0] === "Trade") return PinType.Trade;
    throw Error("Unknown signal type");
}