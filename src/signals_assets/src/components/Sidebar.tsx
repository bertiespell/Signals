import { useContext } from "react";
import {
	ArrowLeftIcon,
	CalendarIcon,
	ChatIcon,
	CreditCardIcon,
	HomeIcon,
	LocationMarkerIcon,
	QuestionMarkCircleIcon,
	UserIcon,
} from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";

import { ShowMapContext } from "../context/show-map";
import { MapContext } from "../context/map";
import { v4 as uuidv4 } from "uuid";
import { CreationState, NewPinContext } from "../context/new-pin";

type NavItem = {
	name: string;
	icon: any;
	location: string;
};

export default function Sidebar() {
	const { setShowMap } = useContext(ShowMapContext);
	const { setActiveContent, newPinContent, createNewActivePin, map } =
		useContext(MapContext);
	const { setInteractionState } = useContext(NewPinContext);
	let navigate = useNavigate();

	const navigation: Array<NavItem> = [
		{ name: "New Signal", location: "/", icon: LocationMarkerIcon },
		{ name: "Chats", location: "/list/chats", icon: ChatIcon },
		{ name: "Trades", location: "/list/trades", icon: CreditCardIcon },
		{ name: "Events", location: "/list/events", icon: CalendarIcon },
		{
			name: "About",
			location: "/about",
			icon: QuestionMarkCircleIcon,
		},
	];

	const handleNavEvent = (e: any, nav_item: NavItem) => {
		if (nav_item.name === "New Signal") {
			setInteractionState(CreationState.Starting);

			if (!newPinContent) {
				createNewActivePin();
			} else {
				setActiveContent(newPinContent);
				setShowMap(true);
			}
			try {
				newPinContent?.marker.setLatLng(map.getCenter());
				map.setView(map.getCenter());
			} catch {}
		} else {
			setShowMap(false);
		}
		navigate(nav_item.location);
	};

	return (
		<div className="hidden lg:flex lg:flex-shrink-0">
			<div className="flex flex-col w-20">
				<div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-signalBlue-500">
					<div className="flex-1">
						<div className=" py-4 flex items-center justify-center bg-signalBlue-500">
							<button
								onClick={(e) =>
									handleNavEvent(e, {
										name: "About",
										location: "/about",
										icon: QuestionMarkCircleIcon,
									})
								}
							>
								<img
									className="w-max"
									src="../../logo-rectangle.png"
									alt="Workflow"
								/>
							</button>
						</div>
						<nav
							aria-label="Sidebar"
							className="py-6 flex flex-col items-center space-y-3"
						>
							{navigation.map((item) => (
								<button
									key={uuidv4()}
									className="flex items-center p-4 rounded-lg text-signalBlue-50 hover:bg-signalBlue-700"
									onClick={(e) => handleNavEvent(e, item)}
								>
									<item.icon
										className="h-6 w-6"
										aria-hidden="true"
									/>
									<span className="sr-only">{item.name}</span>
								</button>
							))}
						</nav>
					</div>
					<div className="flex-shrink-0 flex pb-5">
						<button
							className="flex-shrink-0 w-full"
							onClick={(e) =>
								handleNavEvent(e, {
									name: "ProfileImage",
									location: "/profile",
								} as NavItem)
							}
						>
							<img
								className="block mx-auto h-10 w-10 rounded-full"
								src="https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png"
								alt=""
							/>
							<div className="sr-only">
								<p>Account settings</p>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
