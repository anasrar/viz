import { join } from "path";
import {
	app,
	BrowserWindow,
	ipcMain,
	type IpcMainEvent,
	shell,
} from "electron";
import { getPath } from "../utils/resources";
import ClientListener from "../client/main";

let win: BrowserWindow | null = null;
export type TIPCChannel = {
	// data type for ipc send and get
	client_get: [
		{
			host: string;
			port: number;
			running: boolean;
			paused: boolean;
		},
		null
	];
	client_connect: [
		{ ok: boolean; message: string },
		{
			host: string;
			port: number;
		}
	];
	client_disconnect: [{ ok: boolean; message: string }, null];
	client_pause: [null, null];
	client_resume: [null, null];
};

const WindowClientListener = {
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
			title: "Client Listener",
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
				hash: "/client",
			});
		} else {
			win.loadURL(
				`http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}#/client`
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
export const ClientListenerInitIPC = () => {
	if (ipc)
		return {
			ok: false,
			message: "client listener ipc already registered",
		};

	WindowClientListener.addListener("client_get", () => {
		WindowClientListener.send("client_get", {
			host: ClientListener.host,
			port: ClientListener.port,
			running: ClientListener.isRunning(),
			paused: !ClientListener.isEmit(),
		});
	});

	WindowClientListener.addListener(
		"client_connect",
		async (_event, { host, port }) => {
			WindowClientListener.send(
				"client_connect",
				await ClientListener.start(host, port)
			);
		}
	);

	WindowClientListener.addListener("client_disconnect", async () => {
		WindowClientListener.send("client_disconnect", await ClientListener.stop());
	});

	WindowClientListener.addListener("client_pause", () => {
		ClientListener.setEmit(false);
		WindowClientListener.send("client_pause", null);
	});

	WindowClientListener.addListener("client_resume", () => {
		ClientListener.setEmit(true);
		WindowClientListener.send("client_resume", null);
	});

	ClientListener.event.addListener("closeByHost", () => {
		WindowClientListener.send("client_connect", {
			ok: false,
			message: "server closed",
		});
	});

	ipc = true;
	return {
		ok: true,
		message: "client listener ipc registered",
	};
};

export default WindowClientListener;
