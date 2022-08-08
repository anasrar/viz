declare global {
	type ClientMouseButtonEvent = {
		type: "mouse_button";
		data: {
			type: "up" | "down";
			button: "left" | "middle" | "right" | "?";
			time: number;
		};
	};

	type ClientMouseWheelEvent = {
		type: "mouse_wheel";
		data: {
			delta: -1 | 1;
			time: number;
		};
	};

	type ClientMouseMoveEvent = {
		type: "mouse_move";
		data: {
			x: number;
			y: number;
			time: number;
		};
	};

	type ClientKeyboardModifier =
		| "shift"
		| "ctrl"
		| "alt"
		| "alt gr"
		| "windows"
		| string;

	type ClientKeyboardEvent = {
		type: "keyboard";
		data: {
			type: "up" | "down";
			value: string;
			code: number;
			alias_code: number[];
			modifier: boolean;
			modifiers: ClientKeyboardModifier[];
			margin: boolean;
		};
	};

	type PapanEvent =
		| ClientKeyboardEvent
		| ClientMouseButtonEvent
		| ClientMouseWheelEvent
		| ClientMouseMoveEvent;
}

export {};
