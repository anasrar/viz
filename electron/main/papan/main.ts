import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { type ChildProcessWithoutNullStreams, spawn } from "child_process";
import { getPapanPath } from "../utils/resources";

export const os: Record<string, [string, string[]]> = {
	linux: ["pkexec", [getPapanPath("papan"), process.pid.toString()]],
	win32: [getPapanPath("papan.exe"), [process.pid.toString()]],
};

let papanSpawn: ChildProcessWithoutNullStreams | null = null;
let emit = true;
type MessageEvents = {
	keyboard_up: (data: ClientKeyboardEvent["data"]) => void;
	keyboard_down: (data: ClientKeyboardEvent["data"]) => void;
	mouse_button_up: (data: ClientMouseButtonEvent["data"]) => void;
	mouse_button_down: (data: ClientMouseButtonEvent["data"]) => void;
	mouse_wheel: (data: ClientMouseWheelEvent["data"]) => void;
	mouse_move: (data: ClientMouseMoveEvent["data"]) => void;
};

const Papan = {
	event: new EventEmitter() as TypedEmitter<MessageEvents>,

	start: () => {
		if (papanSpawn !== null) {
			return {
				ok: false,
				message: "papan already running",
			};
		}

		const [command, args] = os[process.platform];
		papanSpawn = spawn(command, args);
		papanSpawn.stdout.on("data", (buff: Buffer) => {
			if (!emit) return;
			const data = buff
				.toString()
				.split(/\r\n|\r|\n/)
				.filter((val: string) => val);
			for (const str of data) {
				const eventData = JSON.parse(str) as PapanEvent;
				switch (eventData.type) {
					case "keyboard":
						Papan.event.emit(`keyboard_${eventData.data.type}`, eventData.data);
						break;

					case "mouse_button":
						Papan.event.emit(
							`mouse_button_${eventData.data.type}`,
							eventData.data
						);
						break;

					case "mouse_wheel":
						Papan.event.emit("mouse_wheel", eventData["data"]);
						break;

					case "mouse_move":
						Papan.event.emit("mouse_move", eventData["data"]);
						break;
				}
			}
		});

		return {
			ok: true,
			message: "papan running",
		};
	},

	stop: () => {
		if (papanSpawn === null)
			return {
				ok: false,
				message: "papan not running",
			};

		papanSpawn.stdin.cork();
		papanSpawn.stdin.write("exit\n");
		papanSpawn.stdin.uncork();
		papanSpawn.stdout.destroy();
		papanSpawn.stderr.destroy();
		papanSpawn = null;

		return {
			ok: true,
			message: "papan stop successfully",
		};
	},

	isRunning: () => papanSpawn !== null,

	isEmit: () => emit,
	setEmit: (val: boolean) => {
		emit = val;
	},
};

export default Papan;
