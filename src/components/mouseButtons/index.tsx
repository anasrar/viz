import type { TThemeLayoutComponentMouseButtons } from "../../../electron/main/theme/layout/components/mouseButtons";
import { type FC, useEffect, useState } from "react";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	alias: string[];
	pressed: boolean[];
	hasBeenPress: boolean;
	init: (val: string[]) => void;
	update: (data: ClientMouseButtonEvent["data"]) => void;
};

const ComponentMouseButtons: FC<TThemeLayoutComponentMouseButtons> = ({
	buttons,
	className,
	classActive,
	classHasBeenPress,
	text,
}) => {
	const [useStore] = useState(() =>
		create<TStore>((set) => ({
			alias: [],
			pressed: [],
			hasBeenPress: false,
			init: (val) =>
				set({ alias: val, pressed: new Array(val.length).fill(false) }),
			update: (data) =>
				set(({ alias, pressed, hasBeenPress }) => {
					pressed[alias.indexOf(data.button)] = data.type === "down";
					if (!hasBeenPress) {
						hasBeenPress = true;
					}
					return {
						alias,
						pressed,
						hasBeenPress,
					};
				}),
		}))
	);
	const keys = useStore();

	useEffect(() => {
		keys.init(buttons ?? []);

		const removeListeners: (() => void)[] = [];
		for (const button of buttons ?? []) {
			removeListeners.push(
				IPCRender.onCaptureMouse(
					"main_capture_mouse_button",
					button,
					(data) => {
						keys.update(data);
					}
				)
			);
		}

		return () => {
			for (const removeListener of removeListeners) {
				removeListener();
			}
		};
	}, []);

	return (
		<div
			className={`${className} ${keys.hasBeenPress ? classHasBeenPress : ""} ${
				keys.pressed.some((val) => val) ? classActive : ""
			}`}
			dangerouslySetInnerHTML={{ __html: text ?? "" }}
		></div>
	);
};

export default ComponentMouseButtons;
