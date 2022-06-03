import { Size, useWindowSize } from "./hooks/window-size";

const Map = () => {
	const size: Size = useWindowSize();

	return (
		<main>
			<div className="max-w-7xl mx-auto ">
				<div id="map" style={{ height: size.height }}></div>
			</div>
		</main>
	);
};

export default Map;
