import MapProvider from "./context/map";
import UserProvider from "./context/user";
import ShowMapContext from "./context/show-map";
import DaoContext from "./context/dao";
import SystemContext from "./context/system";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import About from "./routes/About";
import Sidebar from "./components/Sidebar";
import Profile from "./routes/Profile";
import ListChats from "./routes/list/Chats";
import ListEvents from "./routes/list/Events";
import ListTrades from "./routes/list/Trades";
import LayoutPanels from "./components/LayoutPanels";
import NewPinContext from "./context/new-pin";

const App = () => {
	return (
		<>
			<BrowserRouter>
				<ShowMapContext>
					<UserProvider>
						<SystemContext>
							<DaoContext>
								<MapProvider>
									<NewPinContext>
										<div className="h-full flex">
											<Sidebar />
											<div className="flex-1 flex overflow-hidden">
												<LayoutPanels />
												<Routes>
													<Route
														path="/"
														element={<></>}
													></Route>
													<Route
														path="about"
														element={<About />}
													/>
													<Route
														path="/profile"
														element={<Profile />}
													/>

													<Route
														path="/list/chats"
														element={<ListChats />}
													/>
													<Route
														path="/list/events"
														element={<ListEvents />}
													/>
													<Route
														path="/list/trades"
														element={<ListTrades />}
													/>
												</Routes>
											</div>
										</div>
									</NewPinContext>
								</MapProvider>
							</DaoContext>
						</SystemContext>
					</UserProvider>
				</ShowMapContext>
			</BrowserRouter>
		</>
	);
};

export default App;
