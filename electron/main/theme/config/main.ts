import { z } from "zod";

const validateObject = z.object({
	window: z
		.object({
			width: z.number().optional().default(200),
			height: z.number().optional().default(200),
		})
		.optional()
		.default({}),
	ignoreCodes: z.number().array().optional().default([]),
	replaceCodes: z
		.record(
			z.object({
				value: z.string(),
				margin: z.boolean().optional().default(false),
			})
		)
		.optional()
		.default({}),
	ignoreValues: z.string().array().optional().default([]),
	replaceValues: z
		.record(
			z.object({
				value: z.string(),
				margin: z.boolean().optional().default(false),
			})
		)
		.optional()
		.default({}),
});

type TThemeConfig = {
	validateObject: typeof validateObject;
	data: z.infer<typeof validateObject>;
	setData: (val: z.infer<typeof validateObject>) => void;
};

const ThemeConfig: TThemeConfig = {
	validateObject,
	data: validateObject.parse({}),
	setData: (val) => {
		ThemeConfig.data = val;
	},
};

export default ThemeConfig;
