import { z } from "zod";

export const ThemeLayoutComponentKeyHistory = z.object({
	type: z.enum(["keyHistory"]).default("keyHistory"),
	id: z.number().default(1),
	counterStart: z.number().default(3),
	separator: z.string().default("+"),
	reset: z.number().default(2000),
	className: z.string().default("keyHistory"),
	classHasModifiers: z.string().default("hasmodifiers"),
	classHasMargin: z.string().default("hasmargin"),
});

export type TThemeLayoutComponentKeyHistory = z.infer<
	typeof ThemeLayoutComponentKeyHistory
>;
