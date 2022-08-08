import { join } from "path";
import { readdirSync, readFileSync } from "fs";
import { z } from "zod";
import ThemeConfig from "./config/main";
import ThemeLayout from "./layout/main";

export type TRequireFiles = "config.json" | "layout.json" | "style.css";
export const requireFiles = ["config.json", "layout.json", "style.css"];

const Theme = {
	validateJSON: <TData>(path: string, data: TData) => {
		let ok = true;
		let message = "";

		try {
			data = JSON.parse(
				readFileSync(path, { encoding: "utf8", flag: "r" })
			) as TData;
		} catch (err) {
			ok = false;
			message = `${err}\nfile: ${path}`;
		}

		return {
			ok,
			message,
			data,
			path,
		};
	},
	validatePath: (path: string) => {
		let ok = true;
		let message = "";
		let config:
			| z.infer<typeof ThemeConfig.validateObject>
			| Record<string, unknown> = {};
		let layout: unknown[] = [];
		let files: string[] = [];

		try {
			files = readdirSync(path);
		} catch (err) {
			ok = false;
			message = `${err}`;
		}

		if (ok) {
			files = files.filter((val) => requireFiles.includes(val));
			if (files.length !== requireFiles.length) {
				ok = false;
				message =
					"missing files: " +
					requireFiles.filter((val) => !files.includes(val)).join(", ");
			}
		}

		if (ok) {
			const {
				ok: okResult,
				message: messageResult,
				data: dataResult,
			} = Theme.validateJSON(join(path, "config.json"), config);
			ok = okResult;
			message = messageResult;
			if (ok) {
				try {
					config = ThemeConfig.validateObject.parse(dataResult);
				} catch (err) {
					ok = false;
					message = `${err}\nfile: config.json`;
					// default config
					config = ThemeConfig.validateObject.parse({});
				}
			}
		}

		if (ok) {
			const {
				ok: okResult,
				message: messageResult,
				data: dataResult,
			} = Theme.validateJSON<typeof layout>(join(path, "layout.json"), layout);
			ok = okResult;
			message = messageResult;
			if (ok) {
				try {
					layout = z.unknown().array().parse(dataResult);
				} catch (err) {
					ok = false;
					message = `${err}\nfile: layout.json`;
				}
			}
			if (ok) {
				const {
					ok: okResult,
					message: messageResult,
					components,
				} = ThemeLayout.validate(layout);
				ok = okResult;
				layout = components;
				if (!ok) {
					message = `${messageResult}\nfile: layout.json`;
				}
			}
		}

		return {
			ok,
			message,
			config,
			layout,
			path,
		};
	},
};

export default Theme;
