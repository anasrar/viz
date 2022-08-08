import { type FC, ChangeEvent, useEffect, useRef, useState } from "react";
import {
	Button,
	Code,
	Group,
	MantineProvider,
	Modal,
	Navbar,
	ScrollArea,
	Stack,
	Switch,
} from "@mantine/core";
import create from "zustand";
import IPCRender from "@/ipc/main";
import { IconFilter, IconTrash } from "@tabler/icons";

type TStore = {
	keyboardRelease: boolean;
	setKeyboardRelease: (val: boolean) => void;
	keyboardPress: boolean;
	setKeyboardPress: (val: boolean) => void;
	mouseButtonRelease: boolean;
	setMouseButtonRelease: (val: boolean) => void;
	mouseButtonPress: boolean;
	setMouseButtonPress: (val: boolean) => void;
	mouseWheel: boolean;
	setMouseWheel: (val: boolean) => void;
	mouseMove: boolean;
	setMouseMove: (val: boolean) => void;
	active: boolean;
	setActive: (val: boolean) => void;
	history: { id: number; data: string }[];
	addHistory: (
		data: string,
		mode:
			| "keyboard_up"
			| "keyboard_down"
			| "mouse_button_up"
			| "mouse_button_down"
			| "mouse_wheel"
			| "mouse_move"
	) => void;
	clearHistory: () => void;
};

const useStore = create<TStore>((set) => ({
	keyboardRelease: false,
	setKeyboardRelease: (val) => set(() => ({ keyboardRelease: val })),
	keyboardPress: true,
	setKeyboardPress: (val) => set(() => ({ keyboardPress: val })),
	mouseButtonRelease: false,
	setMouseButtonRelease: (val) => set(() => ({ mouseButtonRelease: val })),
	mouseButtonPress: false,
	setMouseButtonPress: (val) => set(() => ({ mouseButtonPress: val })),
	mouseWheel: false,
	setMouseWheel: (val) => set(() => ({ mouseWheel: val })),
	mouseMove: false,
	setMouseMove: (val) => set(() => ({ mouseMove: val })),
	active: true,
	setActive: (val) => set(() => ({ active: val })),
	history: [],
	addHistory: (data, mode) =>
		set((state) => {
			if (!state.active) return {};

			switch (mode) {
				case "keyboard_up":
					if (!state.keyboardRelease) return {};
					break;
				case "keyboard_down":
					if (!state.keyboardPress) return {};
					break;
				case "mouse_button_up":
					if (!state.mouseButtonRelease) return {};
					break;
				case "mouse_button_down":
					if (!state.mouseButtonPress) return {};
					break;
				case "mouse_wheel":
					if (!state.mouseWheel) return {};
					break;
				case "mouse_move":
					if (!state.mouseMove) return {};
					break;
				default:
					break;
			}

			return {
				history: [
					...state.history,
					{
						id: Date.now(),
						data: data,
					},
				],
			};
		}),
	clearHistory: () => set(() => ({ history: [] })),
}));

const WindowDebug: FC = () => {
	const {
		keyboardRelease,
		setKeyboardRelease,
		keyboardPress,
		setKeyboardPress,
		mouseButtonRelease,
		setMouseButtonRelease,
		mouseButtonPress,
		setMouseButtonPress,
		mouseWheel,
		setMouseWheel,
		mouseMove,
		setMouseMove,
		active,
		setActive,
		history,
		addHistory,
		clearHistory,
	} = useStore();
	const activeHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setActive(event.currentTarget.checked);
	};
	const clearHistoryHandler = () => {
		clearHistory();
	};

	const [opened, setOpened] = useState(false);

	useEffect(() => {
		const removeListenerKeyboard = IPCRender.on(
			"debug_capture_key",
			({ type, data }) => {
				addHistory(data, `keyboard_${type}`);
			}
		);
		const removeListenerMouseButton = IPCRender.on(
			"debug_capture_mouse_button",
			({ type, data }) => {
				addHistory(data, `mouse_button_${type}`);
			}
		);
		const removeListenerMouseWheel = IPCRender.on(
			"debug_capture_mouse_wheel",
			(data) => {
				addHistory(data, "mouse_wheel");
			}
		);
		const removeListenerMouseMove = IPCRender.on(
			"debug_capture_mouse_move",
			(data) => {
				addHistory(data, "mouse_move");
			}
		);
		return () => {
			removeListenerKeyboard();
			removeListenerMouseButton();
			removeListenerMouseWheel();
			removeListenerMouseMove();
		};
	}, []);

	const historyStack = useRef<HTMLDivElement>(null);
	useEffect(() => {
		(historyStack.current?.lastChild as HTMLDivElement)?.scrollIntoView();
	}, [history]);

	return (
		<MantineProvider
			theme={{ colorScheme: "dark" }}
			withGlobalStyles
			withNormalizeCSS
		>
			<Modal
				opened={opened}
				size="sm"
				onClose={() => setOpened(false)}
				title="Filters"
			>
				<Stack spacing="sm">
					<Group position="apart">
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={keyboardPress}
							onChange={(event) => {
								setKeyboardPress(event.currentTarget.checked);
							}}
							label="Keyboard Button Press"
						/>
					</Group>
					<Group position="apart">
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={keyboardRelease}
							onChange={(event) => {
								setKeyboardRelease(event.currentTarget.checked);
							}}
							label="Keyboard Button Release"
						/>
					</Group>
					<Group position="apart">
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={mouseButtonPress}
							onChange={(event) => {
								setMouseButtonPress(event.currentTarget.checked);
							}}
							label="Mouse Button Press"
						/>
					</Group>
					<Group position="apart">
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={mouseButtonRelease}
							onChange={(event) => {
								setMouseButtonRelease(event.currentTarget.checked);
							}}
							label="Mouse Button Release"
						/>
					</Group>
					<Group position="apart">
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={mouseWheel}
							onChange={(event) => {
								setMouseWheel(event.currentTarget.checked);
							}}
							label="Mouse Wheel"
						/>
					</Group>
					<Group position="apart">
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={mouseMove}
							onChange={(event) => {
								setMouseMove(event.currentTarget.checked);
							}}
							label="Mouse Move"
						/>
					</Group>
				</Stack>
			</Modal>
			<Navbar
				height="100vh"
				p="xs"
				sx={{
					border: 0,
				}}
			>
				<Navbar.Section pb="xs">
					<Group position="apart">
						<Button
							size="xs"
							compact
							leftIcon={<IconFilter size={16} />}
							onClick={() => setOpened(true)}
						>
							Filters
						</Button>
						<Switch
							radius="sm"
							onLabel="ON"
							offLabel="OFF"
							checked={active}
							onChange={activeHandler}
						/>
					</Group>
				</Navbar.Section>

				<Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
					<Stack ref={historyStack} spacing="xs">
						{history.map(({ id, data }) => (
							<Code key={id} block>
								{data}
							</Code>
						))}
					</Stack>
				</Navbar.Section>
				<Navbar.Section pt="xs">
					<Button
						fullWidth
						onClick={clearHistoryHandler}
						leftIcon={<IconTrash size={20} />}
					>
						Clear Log
					</Button>
				</Navbar.Section>
			</Navbar>
		</MantineProvider>
	);
};

export default WindowDebug;
