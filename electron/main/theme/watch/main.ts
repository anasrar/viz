import { basename } from "path";
import { statSync } from "fs";
import chokidar from "chokidar";
import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { TRequireFiles, requireFiles } from "../main";

let watcher: chokidar.FSWatcher | null = null;
type MessageEvents = {
	change: (filename: TRequireFiles) => void;
};

const ThemeWatch = {
	event: new EventEmitter() as TypedEmitter<MessageEvents>,
	start: (path: string) => {
		let ok = true;
		let message = `watch folder: ${path}`;

		if (watcher !== null) {
			ok = false;
			message = "watch folder already running";
		}

		try {
			if (ok && !statSync(path).isDirectory()) {
				ok = false;
				message = `not a folder: ${path}`;
			}
		} catch (err) {
			ok = false;
			message = `${err}`;
		}

		watcher = chokidar.watch(path, {
			depth: undefined,
		});
		watcher.on("change", (pathFile) => {
			const filename = basename(pathFile);
			if (requireFiles.includes(filename)) {
				ThemeWatch.event.emit("change", filename as TRequireFiles);
			}
		});

		return {
			ok,
			message,
		};
	},
	stop: async () => {
		let ok = true;
		let message = "watch folder successfully stop";

		if (watcher !== null) {
			await watcher.close();
			watcher = null;
		} else {
			ok = false;
			message = "watch folder not running";
		}

		return {
			ok,
			message,
		};
	},
	isRunning: () => watcher !== null,
};

export default ThemeWatch;
