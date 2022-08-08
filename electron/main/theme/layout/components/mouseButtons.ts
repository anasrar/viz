import { z } from "zod";

const buttons: z.ZodType<ClientMouseButtonEvent["data"]["button"][]> = z.lazy(
	() => z.enum(["left", "middle", "right", "?"]).array().default([])
);

export const ThemeLayoutComponentMouseButtons = z.object({
	type: z.enum(["mouseButtons"]).default("mouseButtons"),
	id: z.number().default(1),
	buttons,
	className: z.string().default("mouseButtons"),
	classActive: z.string().default("active"),
	classHasBeenPress: z.string().default("hasbeenpress"),
	text: z.string().default(""),
});

export type TThemeLayoutComponentMouseButtons = z.infer<
	typeof ThemeLayoutComponentMouseButtons
>;
