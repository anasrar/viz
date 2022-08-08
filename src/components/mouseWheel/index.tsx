import type { TThemeLayoutComponentMouseWheel } from "../../../electron/main/theme/layout/components/mouseWheel";
import { type FC, useState, useEffect } from "react";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	up: boolean;
	upTimeout: NodeJS.Timeout | undefined;
	upHasBeenActive: boolean;
	upUpdate: (timeout: number) => void;
	down: boolean;
	downTimeout: NodeJS.Timeout | undefined;
	downHasBeenActive: boolean;
	downUpdate: (timeout: number) => void;
};

const ComponentMouseWheel: FC<TThemeLayoutComponentMouseWheel> = ({
	reset,
	className,
	classActive,
	classHasBeenActive,
	textUp,
	textDown,
}) => {
	const [useStore] = useState(() =>
		create<TStore>((set) => ({
			up: false,
			upTimeout: undefined,
			upHasBeenActive: false,
			upUpdate: (timeout) =>
				set(({ upTimeout }) => {
					if (upTimeout !== undefined) {
						clearTimeout(upTimeout);
					}
					return {
						up: true,
						upHasBeenActive: true,
						upTimeout: setTimeout(() => {
							set({ up: false, upTimeout: undefined });
						}, timeout),
					};
				}),
			down: false,
			downTimeout: undefined,
			downHasBeenActive: false,
			downUpdate: (timeout) =>
				set(({ downTimeout }) => {
					if (downTimeout !== undefined) {
						clearTimeout(downTimeout);
					}
					return {
						down: true,
						downHasBeenActive: true,
						downTimeout: setTimeout(() => {
							set({ down: false, downTimeout: undefined });
						}, timeout),
					};
				}),
		}))
	);
	const store = useStore();

	useEffect(() => {
		const removeListener = IPCRender.onCaptureMouse(
			"main_capture_mouse_wheel",
			null,
			(data) => {
				switch (data.delta) {
					case 1:
						store.upUpdate(reset ?? 500);
						break;
					case -1:
						store.downUpdate(reset ?? 500);
						break;
					default:
						break;
				}
			}
		);
		return () => {
			removeListener();
		};
	}, []);

	return (
		<>
			<div
				className={`${className} mouseWheelUp ${store.up ? classActive : ""} ${
					store.upHasBeenActive ? classHasBeenActive : ""
				}`}
				dangerouslySetInnerHTML={{ __html: textUp ?? "" }}
			/>
			<div
				className={`${className} mouseWheelDown ${
					store.down ? classActive : ""
				} ${store.downHasBeenActive ? classHasBeenActive : ""}`}
				dangerouslySetInnerHTML={{ __html: textDown ?? "" }}
			/>
		</>
	);
};

export default ComponentMouseWheel;
