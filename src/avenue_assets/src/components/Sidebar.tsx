import { Fragment, useContext, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
	CalendarIcon,
	ChatIcon,
	CreditCardIcon,
	HomeIcon,
	LocationMarkerIcon,
	QuestionMarkCircleIcon,
	UserIcon,
	XIcon,
} from "@heroicons/react/outline";
import { useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";
import { ShowMapContext } from "../context/show-map";
import { MapContext } from "../context/map";
import { v4 as uuidv4 } from "uuid";

const user = {
	name: "Example",
	email: "example@example.com",
	imageUrl:
		"https://img.icons8.com/external-kiranshastry-lineal-color-kiranshastry/64/undefined/external-user-interface-kiranshastry-lineal-color-kiranshastry.png",
};

type NavItem = {
	name: string;
	icon: any;
	location: string;
};

export default function Sidebar() {
	const { setShowMap } = useContext(ShowMapContext);
	const { setActiveContent, newPinContent, createNewActivePin, map } =
		useContext(MapContext);
	let navigate = useNavigate();

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navigation: Array<NavItem> = [
		{ name: "Home", location: "/", icon: HomeIcon },
		{ name: "New Signal", location: "/", icon: LocationMarkerIcon },
		{ name: "Chats", location: "/list/chats", icon: ChatIcon },
		{ name: "Trades", location: "/list/trades", icon: CreditCardIcon },
		{ name: "Events", location: "/list/events", icon: CalendarIcon },
		{
			name: "Profile",
			location: "/profile",
			icon: UserIcon,
		},
		{
			name: "About",
			location: "/about",
			icon: QuestionMarkCircleIcon,
		},
	];

	const handleNavEvent = (e: any, nav_item: NavItem) => {
		if (nav_item.name === "Home") {
			setShowMap(true);
		} else if (nav_item.name === "New Signal") {
			if (!newPinContent) {
				createNewActivePin();
			} else {
				setActiveContent(newPinContent);
				setShowMap(true);
			}
			map.setView(newPinContent?.marker.getLatLng(), 13);
		} else {
			setShowMap(false);
		}
		navigate(nav_item.location);
	};

	return (
		<>
			<Transition.Root show={mobileMenuOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-40 lg:hidden"
					onClose={setMobileMenuOpen}
				>
					<Transition.Child
						as={Fragment}
						enter="transition-opacity ease-linear duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="transition-opacity ease-linear duration-300"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
					</Transition.Child>

					<div className="fixed inset-0 flex z-40">
						<Transition.Child
							as={Fragment}
							enter="transition ease-in-out duration-300 transform"
							enterFrom="-translate-x-full"
							enterTo="translate-x-0"
							leave="transition ease-in-out duration-300 transform"
							leaveFrom="translate-x-0"
							leaveTo="-translate-x-full"
						>
							<Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
								<Transition.Child
									as={Fragment}
									enter="ease-in-out duration-300"
									enterFrom="opacity-0"
									enterTo="opacity-100"
									leave="ease-in-out duration-300"
									leaveFrom="opacity-100"
									leaveTo="opacity-0"
								>
									<div className="absolute top-0 right-0 -mr-12 pt-4">
										<button
											type="button"
											className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
											onClick={() =>
												setMobileMenuOpen(false)
											}
										>
											<span className="sr-only">
												Close sidebar
											</span>
											<XIcon
												className="h-6 w-6 text-white"
												aria-hidden="true"
											/>
										</button>
									</div>
								</Transition.Child>
								<div className="pt-5 pb-4">
									<div className="flex-shrink-0 flex items-center px-4">
										<img
											className="h-8 w-auto"
											src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=600"
											alt="Workflow"
										/>
									</div>
									<nav aria-label="Sidebar" className="mt-5">
										<div className="px-2 space-y-1">
											{navigation.map((item) => (
												<Link
													key={uuidv4()}
													to={item.location as string}
												>
													<button
														type="submit"
														key={uuidv4()}
														// href={item.href}
														className="group p-2 rounded-md flex items-center text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
													>
														<item.icon
															className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
															aria-hidden="true"
														/>
														{item.name}
													</button>
												</Link>
											))}
										</div>
									</nav>
								</div>
								<div className="flex-shrink-0 flex border-t border-gray-200 p-4">
									<a
										href="#"
										className="flex-shrink-0 group block"
									>
										<div className="flex items-center">
											<div>
												<img
													className="inline-block h-10 w-10 rounded-full"
													src={user.imageUrl}
													alt=""
												/>
											</div>
											<div className="ml-3">
												<p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
													{user.name}
												</p>
												<p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
													Account Settings
												</p>
											</div>
										</div>
									</a>
								</div>
							</Dialog.Panel>
						</Transition.Child>
						<div className="flex-shrink-0 w-14" aria-hidden="true">
							{/* Force sidebar to shrink to fit close icon */}
						</div>
					</div>
				</Dialog>
			</Transition.Root>

			{/* Static sidebar for desktop */}
			<div className="hidden lg:flex lg:flex-shrink-0">
				<div className="flex flex-col w-20">
					<div
						className="flex-1 flex flex-col min-h-0 overflow-y-auto "
						style={{ backgroundColor: "#0075b0" }}
					>
						<div className="flex-1">
							<div
								className=" py-4 flex items-center justify-center"
								style={{ backgroundColor: "#0075b0" }}
							>
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
										src="../../signal-logo.png"
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
										className="flex items-center p-4 rounded-lg text-indigo-200 hover:bg-indigo-700"
										onClick={(e) => handleNavEvent(e, item)}
									>
										<item.icon
											className="h-6 w-6"
											aria-hidden="true"
										/>
										<span className="sr-only">
											{item.name}
										</span>
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
									src={user.imageUrl}
									alt=""
								/>
								<div className="sr-only">
									<p>{user.name}</p>
									<p>Account settings</p>
								</div>
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
