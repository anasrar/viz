import { z } from "zod";

export const ThemeLayoutComponentMouseWheel = z.object({
	type: z.enum(["mouseWheel"]).default("mouseWheel"),
	id: z.number().default(1),
	reset: z.number().default(500),
	className: z.string().default("mouseWheel"),
	classActive: z.string().default("active"),
	classHasBeenActive: z.string().default("hasbeenactive"),
	textUp: z.string().default("up"),
	textDown: z.string().default("down"),
});

export type TThemeLayoutComponentMouseWheel = z.infer<
	typeof ThemeLayoutComponentMouseWheel
>;
