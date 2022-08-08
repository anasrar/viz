import { type FC, useEffect } from "react";
import "inter-ui/inter.css";
import create from "zustand";
import IPCRender from "@/ipc/main";
import { Alert, Code, MantineProvider } from "@mantine/core";
import { IconBug } from "@tabler/icons";

import ComponentDiv from "@/components/div";

type TStore = {
	ok: boolean;
	message: string;
	setValidate: (val: { ok: boolean; message: string }) => void;
	layout: unknown[];
	setLayout: (val: unknown[]) => void;
};

const useStore = create<TStore>((set) => ({
	ok: true,
	message: "",
	setValidate: (val) => set(val),
	layout: [],
	setLayout: (val) => set({ layout: val }),
}));

const WindowMain: FC = () => {
	const store = useStore();

	useEffect(() => {
		const removeListenerThemeFolderValidate = IPCRender.on(
			"main_theme_folder_validate",
			(data) => {
				store.setValidate(data);
				if (data.ok) {
					IPCRender.send("main_get_css", null);
					IPCRender.send("main_get_layout", null);
				}
			}
		);
		const removeListenerGetLayout = IPCRender.on("main_get_layout", (data) => {
			store.setLayout(data);
		});

		IPCRender.send("main_get_css", null);
		IPCRender.send("main_get_layout", null);

		return () => {
			removeListenerThemeFolderValidate();
			removeListenerGetLayout();
		};
	}, []);

	return (
		<>
			{(store.ok && (
				<ComponentDiv
					type="div"
					id={1}
					className="base"
					components={store.layout}
					text="add component in layout.json"
				/>
			)) || (
				<MantineProvider
					theme={{ colorScheme: "dark" }}
					withGlobalStyles
					withNormalizeCSS
				>
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
				</MantineProvider>
			)}
		</>
	);
};

export default WindowMain;
