import type { TThemeLayoutComponentKeyValues } from "../../../electron/main/theme/layout/components/keyValues";
import { type FC, useEffect, useState } from "react";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	alias: string[];
	pressed: boolean[];
	hasBeenPress: boolean;
	init: (val: string[]) => void;
	update: (data: ClientKeyboardEvent["data"]) => void;
};

const ComponentKeyValues: FC<TThemeLayoutComponentKeyValues> = ({
	values,
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
					pressed[alias.indexOf(data.value)] = data.type === "down";
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
		keys.init(values ?? []);

		const removeListeners: (() => void)[] = [];
		for (const value of values ?? []) {
			removeListeners.push(
				IPCRender.onCaptureKey("main_capture_key_value", value, (data) => {
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

export default ComponentKeyValues;
