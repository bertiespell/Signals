import MapProvider from "./context/map";
import UserProvider from "./context/user";
import ShowMapContext from "./context/show-map";
import DaoContext from "./context/dao";
import SystemContext from "./context/system";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import About from "./routes/about";
import Sidebar from "./components/Sidebar";
import Profile from "./routes/profile";
import ListChats from "./routes/list/chats";
import ListEvents from "./routes/list/events";
import ListTrades from "./routes/list/trades";
import LayoutPanels from "./components/LayoutPanels";

const App = () => {
	return (
		<>
			<BrowserRouter>
				<ShowMapContext>
					<UserProvider>
						<SystemContext>
							<DaoContext>
								<MapProvider>
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
