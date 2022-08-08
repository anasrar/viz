import { join } from "path";
import { readFileSync } from "fs";
import {
	app,
	BrowserWindow,
	ipcMain,
	type IpcMainEvent,
	shell,
} from "electron";
import PreferencesStore, { type TPreferencesStore } from "../preferences/main";
import ThemeWatch from "../theme/watch/main";
import Papan from "../papan/main";
import ClientListener from "../client/main";
import Theme from "../theme/main";
import ThemeConfig from "../theme/config/main";
import ThemeLayout from "../theme/layout/main";
import { getPath } from "../utils/resources";

let win: BrowserWindow | null = null;
let css: string | null = null;
const unsubscribePreferencesStore: ReturnType<
	typeof PreferencesStore.onDidChange
>[] = [];
export type TIPCChannel = {
	// data type for ipc send and get
	main_theme_folder_validate: [
		Parameters<TPreferencesStore["setThemeFolderValidate"]>[0],
		null
	];
	main_get_css: [null, null];
	main_get_layout: [unknown[], null];
};
export type TIPCCaptureKey = {
	main_capture_key: "data";
	main_capture_key_value: string;
	main_capture_key_code: number;
};
export type TIPCCaptureMouse = {
	main_capture_mouse_button: [
		ClientMouseButtonEvent["data"]["button"],
		ClientMouseButtonEvent["data"]
	];
	main_capture_mouse_wheel: [null, ClientMouseWheelEvent["data"]];
	main_capture_mouse_move: [null, ClientMouseMoveEvent["data"]];
};

const WindowMain = {
	create: () => {
		if (win !== null) {
			return {
				ok: false,
				message: "window already exist",
			};
		}

		const theme = Theme.validatePath(PreferencesStore.get("themeFolder"));
		ThemeConfig.setData(theme.config);
		ThemeLayout.setData(theme.layout);

		win = new BrowserWindow({
			show: false,
			title: "Viz",
			icon: getPath("icons/app.png"),
			width: ThemeConfig.data.window.width,
			height: ThemeConfig.data.window.height,
			skipTaskbar: true,
			transparent: true,
			resizable: false,
			frame: false,
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
				hash: "/",
			});
		} else {
			win.loadURL(
				`http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`
			);
		}

		win.webContents.setWindowOpenHandler(({ url }) => {
			if (url.startsWith("https:")) shell.openExternal(url);
			return { action: "deny" };
		});

		win.on("close", () => {
			for (const unsubscribe of unsubscribePreferencesStore) {
				unsubscribe();
			}
			win = null;
		});
		win.on("ready-to-show", () => {
			win.show();
			win.setAlwaysOnTop(PreferencesStore.get("windowAlwaysOnTop"), "normal");
			win.setVisibleOnAllWorkspaces(
				PreferencesStore.get("windowAlwaysOnVisibleWorkspace")
			);
			WindowMain.send("main_theme_folder_validate", {
				ok: theme.ok,
				message: theme.message,
			});
		});
		win.on("page-title-updated", (evt) => {
			evt.preventDefault();
		});
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

		unsubscribePreferencesStore.push(
			...[
				PreferencesStore.onDidChange("themeFolder", async (val) => {
					const theme = Theme.validatePath(val);
					ThemeConfig.setData(theme.config);
					ThemeLayout.setData(theme.layout);

					if (win) {
						const [width, height] = win.getSize();
						const { width: newWidth, height: newHeight } =
							ThemeConfig.data.window;
						if (width !== newWidth || height !== newHeight) {
							win?.setBounds({ width: newWidth, height: newHeight });
						}
					}

					await WindowMain.insertCSS();
					WindowMain.send("main_get_layout", ThemeLayout.data);

					WindowMain.send("main_theme_folder_validate", {
						ok: theme.ok,
						message: theme.message,
					});
				}),
				PreferencesStore.onDidChange("windowAlwaysOnTop", (val) => {
					win?.setAlwaysOnTop(val, "normal");
				}),
				PreferencesStore.onDidChange(
					"windowAlwaysOnVisibleWorkspace",
					(val) => {
						win?.setVisibleOnAllWorkspaces(val);
					}
				),
			]
		);

		return {
			ok: true,
			message: "window created",
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

	insertCSS: async () => {
		if (css !== null) {
			await win?.webContents.removeInsertedCSS(css);
		}
		try {
			const cssstring = readFileSync(
				join(PreferencesStore.get("themeFolder"), "style.css"),
				{
					encoding: "utf8",
					flag: "r",
				}
			);
			css = await win?.webContents.insertCSS(cssstring);
		} catch (err) {
			console.error(err);
		}
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

	sendCaptureKey: <TChannel extends keyof TIPCCaptureKey>(
		channel: TChannel,
		val: TIPCCaptureKey[TChannel],
		data: ClientKeyboardEvent["data"]
	) => {
		win?.webContents.send(`${channel}_${val}`, data);
	},

	sendCaptureMouse: <TChannel extends keyof TIPCCaptureMouse>(
		channel: TChannel,
		val: TIPCCaptureMouse[TChannel][0],
		data: TIPCCaptureMouse[TChannel][1]
	) => {
		win?.webContents.send(`${channel}${val === null ? "" : "_" + val}`, data);
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
export const MainInitIPC = () => {
	if (ipc)
		return {
			ok: false,
			message: "main ipc already registered",
		};

	ThemeWatch.event.addListener("change", async (filename) => {
		if (filename === "config.json" || filename === "layout.json") {
			const theme = Theme.validatePath(PreferencesStore.get("themeFolder"));

			WindowMain.send("main_theme_folder_validate", {
				ok: theme.ok,
				message: theme.message,
			});

			if (filename === "config.json") {
				ThemeConfig.setData(theme.config);
				if (win) {
					const [width, height] = win.getSize();
					const { width: newWidth, height: newHeight } =
						ThemeConfig.data.window;
					if (width !== newWidth || height !== newHeight) {
						win?.setBounds({ width: newWidth, height: newHeight });
					}
				}
			}

			if (filename === "layout.json") {
				ThemeLayout.setData(theme.layout);
				WindowMain.send("main_get_layout", ThemeLayout.data);
			}
		}

		if (filename === "style.css") {
			await WindowMain.insertCSS();
		}
	});

	WindowMain.addListener("main_get_css", async () => {
		await WindowMain.insertCSS();
	});

	WindowMain.addListener("main_get_layout", () => {
		WindowMain.send("main_get_layout", ThemeLayout.data);
	});

	const listenerKeyboard = (data: ClientKeyboardEvent["data"]) => {
		WindowMain.sendCaptureKey("main_capture_key_value", data.value, data);
		WindowMain.sendCaptureKey("main_capture_key_code", data.code, data);

		if (
			ThemeConfig.data.ignoreCodes.includes(data.code) ||
			ThemeConfig.data.ignoreValues.includes(data.value)
		) {
			return;
		}

		if (Object.hasOwn(ThemeConfig.data.replaceCodes, data.code)) {
			const { value, margin } = ThemeConfig.data.replaceCodes[data.code];
			data.value = value;
			data.margin = margin;
		} else if (Object.hasOwn(ThemeConfig.data.replaceValues, data.value)) {
			const { value, margin } = ThemeConfig.data.replaceValues[data.value];
			data.value = value;
			data.margin = margin;
		}

		data.modifiers = data.modifiers.map((val) => {
			if (Object.hasOwn(ThemeConfig.data.replaceValues, val)) {
				const { value } = ThemeConfig.data.replaceValues[val];
				return value;
			}
			return val;
		});

		WindowMain.sendCaptureKey("main_capture_key", "data", data);
	};

	Papan.event.addListener("keyboard_down", listenerKeyboard);
	Papan.event.addListener("keyboard_up", listenerKeyboard);
	ClientListener.event.addListener("keyboard_up", listenerKeyboard);
	ClientListener.event.addListener("keyboard_down", listenerKeyboard);

	const listenerMouseButton = (data: ClientMouseButtonEvent["data"]) => {
		WindowMain.sendCaptureMouse("main_capture_mouse_button", data.button, data);
	};

	Papan.event.addListener("mouse_button_up", listenerMouseButton);
	Papan.event.addListener("mouse_button_down", listenerMouseButton);
	ClientListener.event.addListener("mouse_button_up", listenerMouseButton);
	ClientListener.event.addListener("mouse_button_down", listenerMouseButton);

	const listenerMouseWheel = (data: ClientMouseWheelEvent["data"]) => {
		WindowMain.sendCaptureMouse("main_capture_mouse_wheel", null, data);
	};

	Papan.event.addListener("mouse_wheel", listenerMouseWheel);
	ClientListener.event.addListener("mouse_wheel", listenerMouseWheel);

	const listenerMouseMove = (data: ClientMouseMoveEvent["data"]) => {
		WindowMain.sendCaptureMouse("main_capture_mouse_move", null, data);
	};

	Papan.event.addListener("mouse_move", listenerMouseMove);
	ClientListener.event.addListener("mouse_move", listenerMouseMove);

	ipc = true;
	return {
		ok: true,
		message: "main ipc registered",
	};
};

export default WindowMain;
