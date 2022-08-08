import { type FC, useState, useEffect } from "react";
import { Router, Route, BaseLocationHook } from "wouter";

import WindowDebug from "./windows/debug";
import WindowMain from "./windows/main";
import WindowPreferences from "./windows/preferences";
import WindowClientListener from "./windows/client";

const currentLocation = () => {
	return window.location.hash.replace(/^#/, "") || "/";
};
const navigate = (to: string) => (window.location.hash = to);
const useHashLocation: BaseLocationHook = () => {
	const [loc, setLoc] = useState(currentLocation());

	useEffect(() => {
		const handler = () => setLoc(currentLocation());
		window.addEventListener("hashchange", handler);
		return () => window.removeEventListener("hashchange", handler);
	}, []);

	return [loc, navigate];
};

const App: FC = () => {
	return (
		<Router hook={useHashLocation}>
			<Route path="/" component={WindowMain} />
			<Route path="/debug" component={WindowDebug} />
			<Route path="/preferences" component={WindowPreferences} />
			<Route path="/client" component={WindowClientListener} />
		</Router>
	);
};

export default App;
