import MapProvider from "./context/map";
import NewPinProvider from "./context/new-pin";
import Homepage from "./HomePage";

const App = () => {
	return (
		<>
			<MapProvider>
				<NewPinProvider>
					<main style={{ height: "100%" }}>
						<Homepage />
					</main>
				</NewPinProvider>
			</MapProvider>
		</>
	);
};

export default App;
