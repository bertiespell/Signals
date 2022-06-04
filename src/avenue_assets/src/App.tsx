import ActiveContentProvider from "./context/active-content";
import MapProvider from "./context/map";
import NewPinProvider from "./context/new-pin";
import Homepage from "./HomePage";

const App = () => {
	return (
		<>
			<ActiveContentProvider>
				<MapProvider>
					<NewPinProvider>
						<main style={{ height: "100%" }}>
							<Homepage />
						</main>
					</NewPinProvider>
				</MapProvider>
			</ActiveContentProvider>
		</>
	);
};

export default App;
