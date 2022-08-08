import { join } from "path";
import {
	app,
	BrowserWindow,
	ipcMain,
	type IpcMainEvent,
	shell,
} from "electron";
import Papan from "../papan/main";
import ClientListener from "../client/main";
import { getPath } from "../utils/resources";

let win: BrowserWindow | null = null;
export type TIPCChannel = {
	// data type for ipc send and get
	debug_capture_key: [{ type: "up" | "down"; data: string }, null];
	debug_capture_mouse_button: [{ type: "up" | "down"; data: string }, null];
	debug_capture_mouse_wheel: [string, null];
	debug_capture_mouse_move: [string, null];
};

const WindowDebug = {
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
			title: "Debug",
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
				hash: "/debug",
			});
		} else {
			win.loadURL(
				`http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}#/debug`
			);
		}

		win.webContents.setWindowOpenHandler(({ url }) => {
			if (url.startsWith("https:")) shell.openExternal(url);
			return { action: "deny" };
		});

		win.on("close", () => {
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
export const DebugInitIPC = () => {
	if (ipc)
		return {
			ok: false,
			message: "debug ipc already registered",
		};

	const listenerKeyboard = (data: ClientKeyboardEvent["data"]) => {
		WindowDebug.send("debug_capture_key", {
			type: data.type,
			data: JSON.stringify(data, null, 2),
		});
	};

	Papan.event.prependListener("keyboard_up", listenerKeyboard);
	Papan.event.prependListener("keyboard_down", listenerKeyboard);
	ClientListener.event.prependListener("keyboard_up", listenerKeyboard);
	ClientListener.event.prependListener("keyboard_down", listenerKeyboard);

	const listenerMouseButton = (data: ClientMouseButtonEvent["data"]) => {
		WindowDebug.send("debug_capture_mouse_button", {
			type: data.type,
			data: JSON.stringify(data, null, 2),
		});
	};

	Papan.event.prependListener("mouse_button_up", listenerMouseButton);
	Papan.event.prependListener("mouse_button_down", listenerMouseButton);
	ClientListener.event.prependListener("mouse_button_up", listenerMouseButton);
	ClientListener.event.prependListener(
		"mouse_button_down",
		listenerMouseButton
	);

	const listenerMouseWheel = (data: ClientMouseWheelEvent["data"]) => {
		WindowDebug.send(
			"debug_capture_mouse_wheel",
			JSON.stringify(data, null, 2)
		);
	};

	Papan.event.prependListener("mouse_wheel", listenerMouseWheel);
	ClientListener.event.prependListener("mouse_wheel", listenerMouseWheel);

	const listenerMouseMove = (data: ClientMouseMoveEvent["data"]) => {
		WindowDebug.send("debug_capture_mouse_move", JSON.stringify(data, null, 2));
	};

	Papan.event.prependListener("mouse_move", listenerMouseMove);
	ClientListener.event.prependListener("mouse_move", listenerMouseMove);

	ipc = true;
	return {
		ok: true,
		message: "debug ipc registered",
	};
};

export default WindowDebug;
