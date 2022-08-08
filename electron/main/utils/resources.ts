import { join } from "path";
import { app } from "electron";

export const getPath = (...path: string[]) =>
	app.isPackaged
		? join(process.resourcesPath, ...path)
		: join(__dirname, "../../../electron/resources", ...path);

export const getPapanPath = (bin: string) =>
	app.isPackaged
		? getPath("papan", bin)
		: join(__dirname, "../../../python/dist/", bin);
