import { type FC, useEffect } from "react";
import {
	Alert,
	Button,
	Code,
	Group,
	MantineProvider,
	Navbar,
	NumberInput,
	ScrollArea,
	Stack,
	TextInput,
} from "@mantine/core";
import {
	IconBug,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlug,
	IconServer2,
	IconSignRight,
} from "@tabler/icons";
import { useForm } from "@mantine/hooks";
import create from "zustand";
import IPCRender from "@/ipc/main";

type TStore = {
	initial: (val: {
		host: string;
		port: number;
		running: boolean;
		paused: boolean;
	}) => void;
	host: string;
	port: number;
	setHostPort: (val: { host: string; port: number }) => void;
	loadingConnect: boolean;
	setLoadingConnect: (val: boolean) => void;
	running: boolean;
	setRunning: (val: boolean) => void;
	loadingPause: boolean;
	setLoadingPause: (val: boolean) => void;
	paused: boolean;
	setPaused: (val: boolean) => void;
	ok: boolean;
	message: string;
	validate: (val: { ok: boolean; message: string }) => void;
};

const useStore = create<TStore>((set) => ({
	initial: (val) => set(() => val),
	host: "127.0.0.1",
	port: 6789,
	setHostPort: (val) => set(() => val),
	loadingConnect: false,
	setLoadingConnect: (val) => set(() => ({ loadingConnect: val })),
	running: false,
	setRunning: (val) => set(() => ({ running: val })),
	loadingPause: false,
	setLoadingPause: (val) => set(() => ({ loadingPause: val })),
	paused: false,
	setPaused: (val) => set(() => ({ paused: val })),
	ok: true,
	message: "",
	validate: (val) => set(() => val),
}));

const WindowClientListener: FC = () => {
	const store = useStore();

	const form = useForm({
		initialValues: {
			host: store.host,
			port: store.port,
		},
	});

	useEffect(() => {
		const removeListenerGet = IPCRender.on("client_get", (data) => {
			store.initial(data);
			form.setValues({
				host: data.host,
				port: data.port,
			});
		});

		const removeListenerConnect = IPCRender.on("client_connect", (data) => {
			store.setLoadingConnect(false);
			store.validate(data);
			store.setRunning(data.ok);
		});

		const removeListenerDisconnect = IPCRender.on(
			"client_disconnect",
			(data) => {
				store.setLoadingConnect(false);
				store.validate(data);
				store.setRunning(!data.ok);
			}
		);

		const removeListenerPause = IPCRender.on("client_pause", () => {
			store.setLoadingPause(false);
			store.setPaused(true);
		});

		const removeListenerResume = IPCRender.on("client_resume", () => {
			store.setLoadingPause(false);
			store.setPaused(false);
		});

		IPCRender.send("client_get", null);
		return () => {
			removeListenerGet();
			removeListenerConnect();
			removeListenerDisconnect();
			removeListenerPause();
			removeListenerResume();
		};
	}, []);

	return (
		<MantineProvider
			theme={{ colorScheme: "dark" }}
			withGlobalStyles
			withNormalizeCSS
		>
			<form
				onSubmit={form.onSubmit(({ host, port }) => {
					store.setLoadingConnect(true);
					if (store.running) {
						IPCRender.send("client_disconnect", null);
					} else {
						IPCRender.send("client_connect", { host, port });
					}
				})}
			>
				<Navbar
					height="100vh"
					p="xs"
					sx={{
						border: 0,
					}}
				>
					<Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
						<Stack spacing="xs">
							<TextInput
								label="Host"
								placeholder="127.0.0.1"
								icon={<IconServer2 size={18} />}
								required
								disabled={store.running}
								{...form.getInputProps("host")}
							/>
							<NumberInput
								label="Port"
								placeholder="6789"
								icon={<IconSignRight size={18} />}
								required
								disabled={store.running}
								{...form.getInputProps("port")}
							/>
							{!store.ok && (
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
											{store.message}
										</Code>
									</Alert>
								</div>
							)}
						</Stack>
					</Navbar.Section>
					<Navbar.Section pt="xs">
						<Group spacing="xs" grow>
							<Button
								type="submit"
								leftIcon={<IconPlug size={20} />}
								loading={store.loadingConnect}
							>
								{(store.running && "Disconnect") || "Connect"}
							</Button>
							<Button
								leftIcon={
									store.paused ? (
										<IconPlayerPlay size={20} />
									) : (
										<IconPlayerPause size={20} />
									)
								}
								loading={store.loadingPause}
								onClick={() => {
									store.setLoadingPause(true);
									if (store.paused) {
										IPCRender.send("client_resume", null);
									} else {
										IPCRender.send("client_pause", null);
									}
								}}
							>
								{(store.paused && "Resume") || "Pause"}
							</Button>
						</Group>
					</Navbar.Section>
				</Navbar>
			</form>
		</MantineProvider>
	);
};

export default WindowClientListener;
