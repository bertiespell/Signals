import MapProvider from "./context/map";
import UserProvider from "./context/user";
import Homepage from "./HomePage";

const App = () => {
	return (
		<>
			<UserProvider>
				<MapProvider>
					<main style={{ height: "100%" }}>
						<Homepage />
					</main>
				</MapProvider>
			</UserProvider>
		</>
	);
};

export default App;
