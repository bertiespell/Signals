import { ActiveContent } from "../context/map";

export enum PinType {
	Chat = "chat",
	Trade = "trade",
	Event = "event",
}

export type SignalType_2 = { trade: null } | { chat: null } | { event: null };

export const mapSignalToType = (pinType: PinType): SignalType_2 => {
    if (pinType === PinType.Chat) return { chat: null };
    if (pinType === PinType.Trade) return { trade: null };
    if (pinType === PinType.Event) return { event: null };
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
        iconUrl: "../../trade-two.png",
        iconSize: [40, 40],
        iconAnchor: [40, 40],
        popupAnchor: [-3, -76],
    });

    if (Object.keys(signalType)[0] === "chat") return chatIcon;
    if (Object.keys(signalType)[0] === "event") return eventIcon;
    if (Object.keys(signalType)[0] === "trade") return tradeIcon;
    throw Error("Unknown signal type");
};

export const mapActiveContentToPinType = (activeContent: ActiveContent): PinType => {
    if (Object.keys(activeContent.signalMetadata?.signal.signal_type as any)[0] === "chat") return PinType.Chat;
    if (Object.keys(activeContent.signalMetadata?.signal.signal_type as any)[0] === "event") return PinType.Event;
    if (Object.keys(activeContent.signalMetadata?.signal.signal_type as any)[0] === "trade") return PinType.Trade;
    throw Error("Unknown signal type");
}