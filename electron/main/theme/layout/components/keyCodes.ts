import { z } from "zod";

export const ThemeLayoutComponentKeyCodes = z.object({
	type: z.enum(["keyCodes"]).default("keyCodes"),
	id: z.number().default(1),
	codes: z.number().array().default([]),
	className: z.string().default("keyCodes"),
	classActive: z.string().default("active"),
	classHasBeenPress: z.string().default("hasbeenpress"),
	text: z.string().default(""),
});

export type TThemeLayoutComponentKeyCodes = z.infer<
	typeof ThemeLayoutComponentKeyCodes
>;
