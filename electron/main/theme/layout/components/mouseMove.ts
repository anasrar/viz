import { z } from "zod";

export const ThemeLayoutComponentMouseMove = z.object({
	type: z.enum(["mouseMove"]).default("mouseMove"),
	id: z.number().default(1),
	className: z.string().default("mouseMove"),
	classActive: z.string().default("active"),
	classHasBeenMove: z.string().default("hasbeenmove"),
	reset: z.number().default(500),
});

export type TThemeLayoutComponentMouseMove = z.infer<
	typeof ThemeLayoutComponentMouseMove
>;
