import { z } from "zod";

export const ThemeLayoutComponentDiv = z.object({
	type: z.enum(["div"]).default("div"),
	id: z.number().default(1),
	className: z.string().default("div"),
	components: z.unknown().array().default([]),
	text: z.string().default(""),
});

export type TThemeLayoutComponentDiv = z.infer<typeof ThemeLayoutComponentDiv>;
