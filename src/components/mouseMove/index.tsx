import type { TThemeLayoutComponentMouseMove } from "../../../electron/main/theme/layout/components/mouseMove";
import { type FC, useState, useEffect, CSSProperties } from "react";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	active: boolean;
	hasBeenActive: boolean;
	lastPosition: [number, number];
	direction: [number, number];
	timeout: NodeJS.Timeout | undefined;
	skip: number;
	update: (val: [number, number], time: number) => void;
};

const ComponentMouseMove: FC<TThemeLayoutComponentMouseMove> = ({
	className,
	classActive,
	classHasBeenMove,
	reset,
}) => {
	const [useStore] = useState(() =>
		create<TStore>((set) => ({
			active: false,
			hasBeenActive: false,
			lastPosition: [0, 0],
			direction: [0, 0],
			timeout: undefined,
			skip: 0,
			update: (val, time) =>
				set(({ lastPosition, timeout, skip }) => {
					// skip 10 update for smoothing and performance
					if (skip < 10) {
						return {
							skip: skip + 1,
						};
					}

					if (timeout !== undefined) {
						clearTimeout(timeout);
					}
					const newTimeout = setTimeout(() => {
						set({
							active: false,
							direction: [0, 0],
							skip: 0,
						});
					}, time);

					const [lastX, lastY] = lastPosition;
					const [x, y] = val;
					const vector: typeof lastPosition = [x - lastX, y - lastY];
					const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
					if (magnitude === 0) {
						return { timeout: newTimeout };
					}
					const direction: typeof lastPosition = [
						vector[0] / magnitude,
						vector[1] / magnitude,
					];

					return {
						active: true,
						hasBeenActive: true,
						lastPosition: val,
						direction,
						timeout: newTimeout,
						skip: 0,
					};
				}),
		}))
	);
	const store = useStore();

	useEffect(() => {
		const removeListener = IPCRender.onCaptureMouse(
			"main_capture_mouse_move",
			null,
			(data) => {
				store.update([data.x, data.y], reset ?? 500);
			}
		);
		return () => {
			removeListener();
		};
	}, []);

	return (
		<div
			className={`${className} ${store.active ? classActive : ""} ${
				store.hasBeenActive ? classHasBeenMove : ""
			}`}
			style={
				{
					"--x": store.direction[0],
					"--y": store.direction[1],
				} as CSSProperties
			}
		>
			<div className="mouseMoveIndicator" />
		</div>
	);
};

export default ComponentMouseMove;
