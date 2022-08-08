import { z } from "zod";

export const ThemeLayoutComponentKeyValues = z.object({
	type: z.enum(["keyValues"]).default("keyValues"),
	id: z.number().default(1),
	values: z.string().array().default([]),
	className: z.string().default("keyValues"),
	classActive: z.string().default("active"),
	classHasBeenPress: z.string().default("hasbeenpress"),
	text: z.string().default(""),
});

export type TThemeLayoutComponentKeyValues = z.infer<
	typeof ThemeLayoutComponentKeyValues
>;
