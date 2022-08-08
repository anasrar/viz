import { app } from "electron";
import { release } from "os";
import { os } from "./papan/main";
import Tray from "./tray/main";
import { PreferencesInitIPC } from "./windows/preferences";
import WindowMain, { MainInitIPC } from "./windows/main";
import { DebugInitIPC } from "./windows/debug";
import { ClientListenerInitIPC } from "./windows/client";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

app.whenReady().then(async () => {
	if (!(process.platform in os)) {
		console.error("os not supported");
		app.quit();
		return;
	}

	const ipcPreferences = PreferencesInitIPC();
	console.log(ipcPreferences.message);

	const ipcMain = MainInitIPC();
	console.log(ipcMain.message);

	const ipcClientListener = ClientListenerInitIPC();
	console.log(ipcClientListener.message);

	const ipcDebug = DebugInitIPC();
	console.log(ipcDebug.message);

	const resultTray = Tray.init();
	console.log(resultTray.message);

	const resultMain = WindowMain.create();
	console.log(`window main: ${resultMain.message}`);
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		const resultTray = Tray.destroy();
		console.log(resultTray.message);

		app.quit();
	}
});

app.on("activate", () => {
	const result = WindowMain.create();
	console.log(result.message);
});
