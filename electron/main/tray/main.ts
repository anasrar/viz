import {
	Menu,
	MenuItemConstructorOptions,
	nativeTheme,
	Tray as TrayElectron,
} from "electron";
import Papan from "../papan/main";
import ClientListener from "../client/main";
import { getPath } from "../utils/resources";
import WindowDebug from "../windows/debug";
import WindowPreferences from "../windows/preferences";
import WindowMain from "../windows/main";
import WindowClientListener from "../windows/client";

let tray: TrayElectron | null = null;
const menu: MenuItemConstructorOptions[] = [
	{
		label: "Viz",
		icon: getPath("icons/app.png"),
		enabled: false,
	},
	{
		label: "Start Capture",
		click: () => {
			if (!Papan.isRunning()) {
				Papan.start();
			} else {
				Papan.setEmit(!Papan.isEmit());
			}

			menu[1].label = `${
				Papan.isRunning() && Papan.isEmit() ? "Stop" : "Start"
			} Capture`;
			tray?.setContextMenu(Menu.buildFromTemplate(menu));
		},
	},
	{
		label: "Client Listener",
		click: () => {
			const { ok } = WindowClientListener.create();
			if (!ok) WindowClientListener.focus();
		},
	},
	{
		label: "Preferences",
		click: () => {
			const { ok } = WindowPreferences.create();
			if (!ok) WindowPreferences.focus();
		},
	},
	{
		label: "Debug",
		click: () => {
			const { ok } = WindowDebug.create();
			if (!ok) WindowDebug.focus();
		},
	},
	{
		label: "Quit",
		click: () => {
			Papan.stop();
			ClientListener.stop();
			WindowPreferences.close();
			WindowDebug.close();
			WindowMain.close();
			WindowClientListener.close();
		},
	},
];

const Tray = {
	init: () => {
		if (tray !== null) {
			return {
				ok: false,
				message: "tray already running",
			};
		}
		tray = new TrayElectron(
			getPath(
				nativeTheme.shouldUseDarkColors || process.platform === "win32"
					? "tray/icon-dark.png"
					: "tray/icon-light.png"
			)
		);
		tray.setTitle("Viz");
		tray.setToolTip("Viz");
		tray.setContextMenu(Menu.buildFromTemplate(menu));

		return {
			ok: true,
			message: "tray start running",
		};
	},

	destroy: () => {
		if (tray === null) {
			return {
				ok: false,
				message: "tray not yet running",
			};
		}

		tray.destroy();
		return {
			ok: true,
			message: "tray destroyed",
		};
	},
};

export default Tray;
