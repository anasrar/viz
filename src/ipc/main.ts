import { ipcRenderer, type IpcRendererEvent } from "electron";
import type { TIPCChannel as PreferencesIPC } from "../../electron/main/windows/preferences";
import type { TIPCChannel as DebugIPC } from "../../electron/main/windows/debug";
import type {
	TIPCChannel as MainIPC,
	TIPCCaptureKey,
	TIPCCaptureMouse,
} from "../../electron/main/windows/main";
import type { TIPCChannel as ClientListenerIPC } from "../../electron/main/windows/client";

type TIPCChannel = PreferencesIPC & DebugIPC & MainIPC & ClientListenerIPC;

const IPCRender = {
	on: <
		TChannel extends keyof TIPCChannel,
		TData extends TIPCChannel[TChannel][0]
	>(
		channel: TChannel,
		listener: (data: TData) => void
	) => {
		const cb = (_event: IpcRendererEvent, data: TData) => {
			listener(data);
		};
		ipcRenderer.on(channel, cb);
		return () => {
			ipcRenderer.removeListener(channel, cb);
		};
	},

	send: <
		TChannel extends keyof TIPCChannel,
		TData extends TIPCChannel[TChannel][1]
	>(
		channel: TChannel,
		data: TData
	) => {
		ipcRenderer.send(channel, data);
	},

	onCaptureKey: <TChannel extends keyof TIPCCaptureKey>(
		channel: TChannel,
		val: TIPCCaptureKey[TChannel],
		listener: (data: ClientKeyboardEvent["data"]) => void
	) => {
		const cb = (
			_event: IpcRendererEvent,
			data: ClientKeyboardEvent["data"]
		) => {
			listener(data);
		};
		ipcRenderer.on(`${channel}_${val}`, cb);
		return () => {
			ipcRenderer.removeListener(`${channel}_${val}`, cb);
		};
	},

	onCaptureMouse: <TChannel extends keyof TIPCCaptureMouse>(
		channel: TChannel,
		val: TIPCCaptureMouse[TChannel][0],
		listener: (data: TIPCCaptureMouse[TChannel][1]) => void
	) => {
		const cb = (
			_event: IpcRendererEvent,
			data: TIPCCaptureMouse[TChannel][1]
		) => {
			listener(data);
		};
		ipcRenderer.on(`${channel}${val === null ? "" : "_" + val}`, cb);
		return () => {
			ipcRenderer.removeListener(
				`${channel}${val === null ? "" : "_" + val}`,
				cb
			);
		};
	},
};

export default IPCRender;
