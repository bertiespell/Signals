import Map from "../Map";
import InteractionBox from "./InteractionBox";

export default function LayoutPanels() {
	return (
		<>
			{/* Primary column */}
			<section
				aria-labelledby="primary-heading"
				className="min-w-0 flex-1 h-full flex flex-col overflow-y-auto lg:order-last"
			>
				<h1 id="primary-heading" className="sr-only">
					Account
				</h1>
				<div>
					<Map />
				</div>
			</section>

			{/* Secondary column (hidden on smaller screens) */}
			<aside className="hidden lg:block lg:flex-shrink-0 lg:order-first">
				<div className="h-full relative flex flex-col w-96 border-r border-gray-200 bg-white overflow-y-auto grid-cols-1 grid-rows-8">
					{/* TODO: If the current marker is selected, show interaction box, otherwise show the other pansl */}
					<InteractionBox />
				</div>
			</aside>
		</>
	);
}
