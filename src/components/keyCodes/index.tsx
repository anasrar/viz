import type { TThemeLayoutComponentKeyCodes } from "../../../electron/main/theme/layout/components/keyCodes";
import { type FC, useEffect, useState } from "react";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	alias: number[];
	pressed: boolean[];
	hasBeenPress: boolean;
	init: (val: number[]) => void;
	update: (data: ClientKeyboardEvent["data"]) => void;
};

const ComponentKeyCodes: FC<TThemeLayoutComponentKeyCodes> = ({
	codes,
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
					pressed[alias.indexOf(data.code)] = data.type === "down";
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
		keys.init(codes ?? []);

		const removeListeners: (() => void)[] = [];
		for (const code of codes ?? []) {
			removeListeners.push(
				IPCRender.onCaptureKey("main_capture_key_code", code, (data) => {
					keys.update(data);
				})
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

export default ComponentKeyCodes;
