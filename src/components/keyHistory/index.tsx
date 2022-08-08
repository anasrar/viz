import type { TThemeLayoutComponentKeyHistory } from "../../../electron/main/theme/layout/components/keyHistory";
import { useEffect, useState, type FC, type ReactNode } from "react";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	data: {
		value: string;
		modifier: boolean;
		modifiers: ClientKeyboardModifier[];
		margin: boolean;
		count: number;
	}[];
	timeout: NodeJS.Timeout | undefined;
	reset: (val: number) => void;
	push: (val: ClientKeyboardEvent["data"]) => void;
};

const ComponentKeyHistory: FC<TThemeLayoutComponentKeyHistory> = ({
	counterStart,
	separator,
	reset,
	className,
	classHasModifiers,
	classHasMargin,
}) => {
	const [useStore] = useState(() =>
		create<TStore>((set) => ({
			data: [],
			timeout: undefined,
			reset: (val) =>
				set(({ timeout }) => {
					if (timeout !== undefined) {
						clearTimeout(timeout);
					}
					return {
						timeout: setTimeout(() => {
							set({ data: [] });
						}, val),
					};
				}),
			push: (val) =>
				set(({ data }) => {
					const increment =
						data.length > 0 &&
						data.at(-1)?.value === val.value &&
						data.at(-1)?.modifiers.join("+") === val.modifiers.join("+");

					if (increment) {
						data[data.length - 1].count += 1;
					} else {
						data.push({
							value: val.value,
							modifier: val.modifier,
							modifiers: val.modifiers,
							margin: val.margin,
							count: 1,
						});
					}
					return {
						data,
					};
				}),
		}))
	);
	const history = useStore();

	useEffect(() => {
		const removeListenerCaptureKey = IPCRender.onCaptureKey(
			"main_capture_key",
			"data",
			(data) => {
				if (data.type === "down") {
					history.push(data);
					history.reset(reset ?? 2000);
				}
			}
		);
		return () => {
			removeListenerCaptureKey();
		};
	}, []);

	return (
		<div className={className}>
			<bdi>
				{history.data.map(({ value, modifiers, margin, count }) => {
					const result: ReactNode[] = [];

					for (let i = 0; i < Math.min(count, counterStart ?? 3); i++) {
						result.push(
							<span
								key={`${i}${value}`}
								className={`item ${
									modifiers.length !== 0 && classHasModifiers
								} ${margin && classHasMargin}`}
							>
								{[...modifiers, value].map((val, i) => {
									return (
										<span key={`${i}${val}`}>
											<span
												className="key"
												dangerouslySetInnerHTML={{ __html: val }}
											/>
											{modifiers.length !== i && (
												<span
													className="separator"
													dangerouslySetInnerHTML={{ __html: separator ?? "" }}
												/>
											)}
										</span>
									);
								})}
								{i === (counterStart ?? 3) - 1 &&
								count - (counterStart ?? 3) > 0 ? (
									<span className="count">{count}</span>
								) : (
									""
								)}
							</span>
						);
					}
					return result;
				})}
			</bdi>
		</div>
	);
};

export default ComponentKeyHistory;
