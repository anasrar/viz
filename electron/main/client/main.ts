import { Socket } from "net";
import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";

let running = false;
let closeByHost = false;
let emit = true;
type MessageEvents = {
	closeByHost: () => void;
	keyboard_up: (data: ClientKeyboardEvent["data"]) => void;
	keyboard_down: (data: ClientKeyboardEvent["data"]) => void;
	mouse_button_up: (data: ClientMouseButtonEvent["data"]) => void;
	mouse_button_down: (data: ClientMouseButtonEvent["data"]) => void;
	mouse_wheel: (data: ClientMouseWheelEvent["data"]) => void;
	mouse_move: (data: ClientMouseMoveEvent["data"]) => void;
};

const client = new Socket();
client.on("data", (buff) => {
	if (!emit) return;
	const data = buff
		.toString()
		.split(/\r\n|\r|\n/)
		.filter((val: string) => val);
	for (const str of data) {
		const eventData = JSON.parse(str) as PapanEvent;
		switch (eventData.type) {
			case "keyboard":
				ClientListener.event.emit(
					`keyboard_${eventData.data.type}`,
					eventData.data
				);
				break;
			case "mouse_button":
				ClientListener.event.emit(
					`mouse_button_${eventData.data.type}`,
					eventData.data
				);
				break;
			case "mouse_wheel":
				ClientListener.event.emit("mouse_wheel", eventData["data"]);
				break;
			case "mouse_move":
				ClientListener.event.emit("mouse_move", eventData["data"]);
				break;
		}
	}
});
client.on("connect", () => {
	running = true;
});
client.on("close", () => {
	running = false;
	if (closeByHost) {
		ClientListener.event.emit("closeByHost");
	}
	closeByHost = false;
});
client.on("error", (err) => {
	running = false;
	console.error(err);
});

const ClientListener = {
	event: new EventEmitter() as TypedEmitter<MessageEvents>,

	host: "127.0.0.1",
	port: 6789,

	start: async (host: string, port: number) => {
		if (running) {
			return {
				ok: false,
				message: "client already running",
			};
		}

		ClientListener.host = host;
		ClientListener.port = port;

		const result = new Promise<{ ok: boolean; message: string }>((resolve) => {
			client.prependOnceListener("error", (err) => {
				resolve({
					ok: false,
					message: `${err}`,
				});
			});

			client.prependOnceListener("connect", () => {
				closeByHost = true;
				resolve({
					ok: true,
					message: "client listener running",
				});
			});
		});
		client.connect(port, host);

		return await result;
	},

	stop: async () => {
		if (!running)
			return {
				ok: false,
				message: "client listener not running",
			};

		const result = new Promise<{ ok: boolean; message: string }>((resolve) => {
			client.prependOnceListener("error", (err) => {
				resolve({
					ok: false,
					message: `${err}`,
				});
			});

			client.prependOnceListener("close", () => {
				closeByHost = false;
				resolve({
					ok: true,
					message: "client listener stop successfully",
				});
			});
		});
		client.destroy();

		return await result;
	},

	isRunning: () => running,

	isEmit: () => emit,
	setEmit: (val: boolean) => {
		emit = val;
	},
};

export default ClientListener;
