import { useContext, useEffect, useRef } from "react";
import { MapContext } from "./context/map";
import { Size, useWindowSize } from "./hooks/window-size";

const Map = () => {
	const size: Size = useWindowSize();
	const myRef = useRef(null);

	const { setRefReady } = useContext(MapContext);

	useEffect(() => {
		setRefReady();
	}, [setRefReady]);

	setTimeout(function () {
		window.dispatchEvent(new Event("resize"));
	});

	return (
		<main>
			<div
				ref={myRef}
				id="map"
				style={{ height: size.height, zIndex: "10" }}
			></div>
		</main>
	);
};

export default Map;
