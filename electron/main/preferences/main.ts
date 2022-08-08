import Store, { Schema } from "electron-store";
import { getPath } from "../utils/resources";

export type TPreferencesSchema = {
	// theme
	themeFolder: string;
	// window
	windowAlwaysOnTop: boolean;
	windowAlwaysOnVisibleWorkspace: boolean;
};

// for render side
export type TPreferencesStore = TPreferencesSchema & {
	initial: (val: TPreferencesSchema) => void;
	discardable: boolean;
	setDiscardable: (val: boolean) => void;

	setThemeFolder: (val: string) => void;
	themeFolderOk: boolean;
	themeFolderMessage: string;
	setThemeFolderValidate: (val: { ok: boolean; message: string }) => void;
	themeWatch: boolean;
	setThemeWatch: (val: boolean) => void;
	themeWatchLoading: boolean;
	setThemeWatchLoading: (val: boolean) => void;

	setWindowAlwaysOnTop: (val: TPreferencesSchema["windowAlwaysOnTop"]) => void;
	setWindowAlwaysOnVisibleWorkspace: (
		val: TPreferencesSchema["windowAlwaysOnVisibleWorkspace"]
	) => void;
};

export const PreferencesSchema: Schema<TPreferencesSchema> = {
	themeFolder: {
		type: "string",
		default: getPath("theme/default"),
	},
	windowAlwaysOnTop: {
		type: "boolean",
		default: true,
	},
	windowAlwaysOnVisibleWorkspace: {
		type: "boolean",
		default: false,
	},
};

const PreferencesStore = new Store<TPreferencesSchema>({
	schema: PreferencesSchema,
	watch: true,
});

export default PreferencesStore;
