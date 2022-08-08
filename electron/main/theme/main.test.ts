import { assert, test } from "vitest";

import Theme from "./main";
import { join } from "path";

const path = join(process.cwd(), "electron/resources/theme/default");
const validateTheme = Theme.validatePath(path);

// console.log({ config: validateTheme.config, layout: validateTheme.layout });

test("theme folder validation", () => {
	assert.deepEqual(
		{
			ok: validateTheme.ok,
			message: validateTheme.message,
			path: validateTheme.path,
		},
		{
			ok: true,
			message: "",
			path,
		}
	);
});
