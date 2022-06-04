import MapProvider from "./context/map";
import Homepage from "./HomePage";

const App = () => {
	return (
		<>
			<MapProvider>
				<main style={{ height: "100%" }}>
					<Homepage />
				</main>
			</MapProvider>
		</>
	);
};

export default App;
