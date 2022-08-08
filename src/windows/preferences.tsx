import { ChangeEvent, useEffect, type FC } from "react";
import {
	Alert,
	Button,
	Code,
	Group,
	MantineProvider,
	Navbar,
	ScrollArea,
	Stack,
	Switch,
	Text,
} from "@mantine/core";
import {
	IconAlertCircle,
	IconAppWindow,
	IconBug,
	IconDeviceFloppy,
	IconFolder,
	IconReplace,
	IconShirt,
	IconTrash,
} from "@tabler/icons";
import type { TPreferencesStore } from "../../electron/main/preferences/main";
import create from "zustand";
import IPCRender from "@/ipc/main";

const useStore = create<TPreferencesStore>((set) => ({
	initial: (val) => set({ ...val, discardable: false }),
	discardable: false,
	setDiscardable: (val) => set({ discardable: val }),

	themeFolder: "",
	setThemeFolder: (val) => set({ themeFolder: val, discardable: true }),
	themeFolderOk: true,
	themeFolderMessage: "",
	setThemeFolderValidate: ({ ok, message }) =>
		set({
			themeFolderOk: ok,
			themeFolderMessage: message,
		}),
	themeWatch: false,
	setThemeWatch: (val) => set({ themeWatch: val }),
	themeWatchLoading: false,
	setThemeWatchLoading: (val) => set({ themeWatchLoading: val }),

	windowAlwaysOnTop: true,
	setWindowAlwaysOnTop: (val) => {
		set({ windowAlwaysOnTop: val, discardable: true });
		IPCRender.send("preferences_set_always_on_top", val);
	},
	windowAlwaysOnVisibleWorkspace: false,
	setWindowAlwaysOnVisibleWorkspace: (val) => {
		set({ windowAlwaysOnVisibleWorkspace: val, discardable: true });
		IPCRender.send("preferences_set_always_on_visible_workspace", val);
	},
}));

const WindowPreferences: FC = () => {
	const {
		initial,
		discardable,
		setDiscardable,

		themeFolder,
		setThemeFolder,
		themeFolderOk,
		themeFolderMessage,
		setThemeFolderValidate,
		themeWatch,
		setThemeWatch,
		themeWatchLoading,
		setThemeWatchLoading,

		windowAlwaysOnTop,
		setWindowAlwaysOnTop,
		windowAlwaysOnVisibleWorkspace,
		setWindowAlwaysOnVisibleWorkspace,
	} = useStore();
	const alwaysOnTopHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setWindowAlwaysOnTop(event.currentTarget.checked);
	};
	const alwaysOnVisibleWorkspaceHandler = (
		event: ChangeEvent<HTMLInputElement>
	) => {
		setWindowAlwaysOnVisibleWorkspace(event.currentTarget.checked);
	};

	useEffect(() => {
		const removeListenerGet = IPCRender.on("preferences_get", (data) => {
			initial(data);
		});
		const removeListenerThemeSelectFolder = IPCRender.on(
			"preferences_set_theme_folder",
			(data) => {
				setThemeFolder(data);
			}
		);
		const removeListenerThemeFolderValidate = IPCRender.on(
			"preferences_theme_folder_validate",
			(data) => {
				setThemeFolderValidate(data);
			}
		);
		const removeListenerThemeWatchStart = IPCRender.on(
			"preferences_theme_watch_start",
			(data) => {
				setThemeWatch(data);
				setThemeWatchLoading(false);
			}
		);
		const removeListenerThemeWatchStop = IPCRender.on(
			"preferences_theme_watch_stop",
			() => {
				setThemeWatch(false);
				setThemeWatchLoading(false);
			}
		);
		IPCRender.send("preferences_get", null);
		return () => {
			removeListenerGet();
			removeListenerThemeSelectFolder();
			removeListenerThemeFolderValidate();
			removeListenerThemeWatchStart();
			removeListenerThemeWatchStop();
		};
	}, []);

	return (
		<MantineProvider
			theme={{ colorScheme: "dark" }}
			withGlobalStyles
			withNormalizeCSS
		>
			<Navbar
				height="100vh"
				p="xs"
				sx={{
					border: 0,
				}}
			>
				<Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
					<Stack spacing="sm">
						<Stack spacing="xs">
							<Group spacing="xs">
								<IconShirt />
								<Text size="xl" weight="bold" transform="uppercase">
									Theme
								</Text>
							</Group>
							<Group grow spacing="xs">
								<Button
									leftIcon={<IconFolder size={20} />}
									onClick={() => {
										IPCRender.send("preferences_set_theme_folder", null);
									}}
								>
									Select Folder
								</Button>
								<Button
									leftIcon={<IconReplace size={20} />}
									color={
										themeWatchLoading ? "gray" : themeWatch ? "green" : "blue"
									}
									onClick={() => {
										setThemeWatchLoading(true);
										if (themeWatch) {
											IPCRender.send("preferences_theme_watch_stop", null);
										} else {
											IPCRender.send("preferences_theme_watch_start", null);
										}
										setThemeWatch(!themeWatch);
									}}
									loading={themeWatchLoading}
								>
									{themeWatch ? "Stop Watch" : "Watch Folder"}
								</Button>
							</Group>
							<div>
								<Alert
									title="Current Folder"
									color="gray"
									icon={<IconFolder />}
								>
									<Code
										block
										sx={() => ({
											whiteSpace: "pre-wrap",
											wordBreak: "break-all",
										})}
									>
										{themeFolder === "" ? "select folder first" : themeFolder}
									</Code>
								</Alert>
							</div>
							{!themeFolderOk && (
								<div>
									<Alert title="Error" color="red" icon={<IconBug />}>
										<Code
											block
											sx={() => ({
												whiteSpace: "pre-wrap",
												wordBreak: "break-all",
											})}
											color="red"
										>
											{themeFolderMessage}
										</Code>
									</Alert>
								</div>
							)}
							<div>
								<Alert title="Info" color="blue" icon={<IconAlertCircle />}>
									Folder must have <strong>config.json</strong>,{" "}
									<strong>layout.json</strong>, and <strong>style.css</strong>{" "}
									(file name case sensitive). Closing preferences or change
									folder will stop watch folder
								</Alert>
							</div>
						</Stack>
						<Stack spacing="xs">
							<Group spacing="xs">
								<IconAppWindow />
								<Text size="xl" weight="bold" transform="uppercase">
									Window
								</Text>
							</Group>
							<Switch
								checked={windowAlwaysOnTop}
								onChange={alwaysOnTopHandler}
								label="Always on Top"
								radius="sm"
							/>
							<Switch
								checked={windowAlwaysOnVisibleWorkspace}
								onChange={alwaysOnVisibleWorkspaceHandler}
								label="Always on Visible Workspace"
								radius="sm"
							/>
						</Stack>
					</Stack>
				</Navbar.Section>
				<Navbar.Section pt="xs">
					<Group grow spacing="xs">
						<Button
							leftIcon={<IconDeviceFloppy size={20} />}
							onClick={() => {
								IPCRender.send("preferences_save", null);
								setDiscardable(false);
							}}
						>
							Save
						</Button>
						<Button
							disabled={!discardable}
							color="red"
							leftIcon={<IconTrash size={20} />}
							onClick={() => {
								IPCRender.send("preferences_get", null);
								IPCRender.send("preferences_discard", null);
							}}
						>
							Discard
						</Button>
					</Group>
				</Navbar.Section>
			</Navbar>
		</MantineProvider>
	);
};

export default WindowPreferences;
