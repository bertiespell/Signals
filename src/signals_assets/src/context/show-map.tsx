import React, { useContext, useEffect, useState } from "react";

export const ShowMapContext = React.createContext<{
	showMap: boolean;
	setShowMap: (arg: boolean) => void;
}>({} as any);

const ShowMapProvider = ({ children }: any) => {
	const [showMap, setShowMap] = useState(true);

	return (
		<ShowMapContext.Provider
			value={{
				showMap,
				setShowMap,
			}}
		>
			{children}
		</ShowMapContext.Provider>
	);
};

export default ShowMapProvider;
