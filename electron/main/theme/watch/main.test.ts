import { assert, test } from "vitest";

import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";
import ThemeWatch from "./main";

const pathFolder = join(process.cwd(), "./.test/watch");
const pathFile = join(pathFolder, "config.json");

mkdirSync(pathFolder, {
	recursive: true,
});

writeFileSync(pathFile, "foo", {
	encoding: "utf8",
	flag: "w",
});

const content = new Date().toISOString();
setTimeout(() => {
	writeFileSync(pathFile, content, {
		encoding: "utf8",
		flag: "w",
	});
}, 1500);

test("watch folder test", async () => {
	const watchStart = ThemeWatch.start(pathFolder);
	assert.deepEqual(
		{
			ok: watchStart.ok,
			message: watchStart.message,
		},
		{
			ok: true,
			message: `watch folder: ${pathFolder}`,
		}
	);

	const watchEvent = new Promise<string>((resolve) => {
		ThemeWatch.event.on("change", (filename) => {
			resolve(filename);
		});
	});

	const filename = await watchEvent;
	assert.strictEqual(filename, "config.json");
	assert.strictEqual(
		readFileSync(pathFile, {
			encoding: "utf8",
			flag: "r",
		}),
		content
	);

	const watchStop = await ThemeWatch.stop();
	assert.deepEqual(
		{
			ok: watchStop.ok,
			message: watchStop.message,
		},
		{
			ok: true,
			message: "watch folder successfully stop",
		}
	);
});
