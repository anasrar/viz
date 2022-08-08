import { join } from "path";
import {
	app,
	BrowserWindow,
	ipcMain,
	type IpcMainEvent,
	shell,
	dialog,
} from "electron";
import PreferencesStore, {
	type TPreferencesStore,
	type TPreferencesSchema,
} from "../preferences/main";
import Theme from "../theme/main";
import ThemeWatch from "../theme/watch/main";
import { getPath } from "../utils/resources";

let win: BrowserWindow | null = null;
export type TIPCChannel = {
	// data type for ipc send and get
	preferences_get: [TPreferencesSchema, null];
	preferences_save: [null, null];
	preferences_discard: [null, null];

	preferences_set_theme_folder: [string, null];
	preferences_theme_folder_validate: [
		Parameters<TPreferencesStore["setThemeFolderValidate"]>[0],
		null
	];
	preferences_theme_watch_start: [boolean, null];
	preferences_theme_watch_stop: [null, null];

	preferences_set_always_on_top: [
		null,
		TPreferencesSchema["windowAlwaysOnTop"]
	];
	preferences_set_always_on_visible_workspace: [
		null,
		TPreferencesSchema["windowAlwaysOnVisibleWorkspace"]
	];
};
let saved = false;
let discard: TPreferencesSchema = {
	...PreferencesStore.store,
} as TPreferencesSchema;

const WindowPreferences = {
	create: () => {
		if (win !== null) {
			return {
				ok: false,
				message: "window already exist",
				data: win,
			};
		}

		win = new BrowserWindow({
			show: false,
			title: "Preferences",
			icon: getPath("icons/app.png"),
			width: 410,
			height: 490,
			transparent: true,
			fullscreenable: false,
			webPreferences: {
				preload: join(__dirname, "../preload/index.js"),
				nodeIntegration: true,
				contextIsolation: false,
			},
		});

		win.removeMenu();

		if (app.isPackaged) {
			win.loadFile(join(__dirname, "../../index.html"), {
				hash: "/preferences",
			});
		} else {
			win.loadURL(
				`http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}#/preferences`
			);
		}

		win.webContents.setWindowOpenHandler(({ url }) => {
			if (url.startsWith("https:")) shell.openExternal(url);
			return { action: "deny" };
		});

		win.on("close", async () => {
			if (!saved) {
				for (const [key, val] of Object.entries(discard)) {
					PreferencesStore.set(key, val);
				}
			}
			await ThemeWatch.stop();
			win = null;
		});
		win.on("page-title-updated", (evt) => {
			evt.preventDefault();
		});
		win.on("ready-to-show", () => {
			win.show();
		});
		if (!app.isPackaged) {
			win.webContents.on("before-input-event", (event, input) => {
				if (
					input.type === "keyDown" &&
					input.control &&
					input.shift &&
					input.key === "I"
				) {
					win.webContents.toggleDevTools();
					event.preventDefault();
				}
			});
		}

		saved = false;
		discard = { ...PreferencesStore.store } as TPreferencesSchema;

		return {
			ok: true,
			message: "window created",
			data: win,
		};
	},

	focus: () => {
		if (win !== null) {
			win.focus();
			return true;
		}
		return false;
	},

	close: () => {
		if (win !== null) {
			win.close();
			return true;
		}
		return false;
	},

	send: <
		TChannel extends keyof TIPCChannel,
		TData extends TIPCChannel[TChannel][0]
	>(
		channel: TChannel,
		data: TData
	) => {
		win?.webContents.send(channel, data);
	},

	addListener: <
		TChannel extends keyof TIPCChannel,
		TData extends TIPCChannel[TChannel][1]
	>(
		channel: TChannel,
		listener: (event: IpcMainEvent, data: TData) => void
	) => {
		ipcMain.on(channel, listener);
	},
};

let ipc = false;
export const PreferencesInitIPC = () => {
	if (ipc)
		return {
			ok: false,
			message: "preferences ipc already registered",
		};

	WindowPreferences.addListener("preferences_get", () => {
		WindowPreferences.send("preferences_get", discard);

		const path = PreferencesStore.get("themeFolder");
		const validate = Theme.validatePath(path);
		WindowPreferences.send("preferences_theme_folder_validate", {
			ok: validate.ok,
			message: validate.message,
		});
	});

	WindowPreferences.addListener("preferences_save", () => {
		saved = true;
	});

	WindowPreferences.addListener("preferences_discard", () => {
		for (const [key, val] of Object.entries(discard)) {
			PreferencesStore.set(key, val);
		}

		saved = false;
		const validate = Theme.validatePath(discard.themeFolder);
		WindowPreferences.send("preferences_theme_folder_validate", {
			ok: validate.ok,
			message: validate.message,
		});
	});

	WindowPreferences.addListener("preferences_set_theme_folder", async () => {
		const result = await dialog.showOpenDialog(win, {
			properties: ["openDirectory"],
		});

		if (!result.canceled) {
			const path = result.filePaths.join();
			PreferencesStore.set("themeFolder", path);
			WindowPreferences.send(
				"preferences_set_theme_folder",
				result.filePaths.join()
			);

			const validate = Theme.validatePath(path);
			WindowPreferences.send("preferences_theme_folder_validate", {
				ok: validate.ok,
				message: validate.message,
			});

			if (ThemeWatch.isRunning()) {
				await ThemeWatch.stop();
				WindowPreferences.send("preferences_theme_watch_stop", null);
			}
		}
	});

	ThemeWatch.event.addListener("change", (filename) => {
		if (filename !== "style.css") {
			const result = Theme.validatePath(PreferencesStore.get("themeFolder"));
			WindowPreferences.send("preferences_theme_folder_validate", {
				ok: result.ok,
				message: result.message,
			});
		}
	});

	WindowPreferences.addListener("preferences_theme_watch_start", () => {
		const result = ThemeWatch.start(PreferencesStore.get("themeFolder"));
		WindowPreferences.send("preferences_theme_watch_start", result.ok);
		if (!result.ok) {
			WindowPreferences.send("preferences_theme_folder_validate", {
				ok: result.ok,
				message: result.message,
			});
		}
	});

	WindowPreferences.addListener("preferences_theme_watch_stop", async () => {
		const result = await ThemeWatch.stop();
		WindowPreferences.send("preferences_theme_watch_stop", null);
		if (!result.ok) {
			WindowPreferences.send("preferences_theme_folder_validate", {
				ok: result.ok,
				message: result.message,
			});
		}
	});

	WindowPreferences.addListener(
		"preferences_set_always_on_top",
		(_event, data) => {
			PreferencesStore.set("windowAlwaysOnTop", data);
		}
	);

	WindowPreferences.addListener(
		"preferences_set_always_on_visible_workspace",
		(_event, data) => {
			PreferencesStore.set("windowAlwaysOnVisibleWorkspace", data);
		}
	);

	ipc = true;
	return {
		ok: true,
		message: "preferences ipc registered",
	};
};

export default WindowPreferences;
