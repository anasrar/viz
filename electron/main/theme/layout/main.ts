import { z } from "zod";
import { ThemeLayoutComponentDiv } from "./components/div";
import { ThemeLayoutComponentKeyHistory } from "./components/keyHistory";
import { ThemeLayoutComponentKeyCodes } from "./components/keyCodes";
import { ThemeLayoutComponentKeyValues } from "./components/keyValues";
import { ThemeLayoutComponentMouseButtons } from "./components/mouseButtons";
import { ThemeLayoutComponentMouseWheel } from "./components/mouseWheel";
import { ThemeLayoutComponentMouseMove } from "./components/mouseMove";

const layoutComponent: Record<string, z.ZodObject<z.ZodRawShape>> = {
	div: ThemeLayoutComponentDiv,
	keyHistory: ThemeLayoutComponentKeyHistory,
	keyValues: ThemeLayoutComponentKeyValues,
	keyCodes: ThemeLayoutComponentKeyCodes,
	mouseButtons: ThemeLayoutComponentMouseButtons,
	mouseWheel: ThemeLayoutComponentMouseWheel,
	mouseMove: ThemeLayoutComponentMouseMove,
};

const ThemeLayout: {
	validateRecursive: (components: unknown[]) => unknown[];
	validate: (components: unknown[]) => {
		ok: boolean;
		message: string;
		components: unknown[];
	};
	data: unknown[];
	setData: (val: unknown[]) => void;
} = {
	validateRecursive: (components) => {
		const result: unknown[] = [];
		let error: unknown | null = null;

		let count = 1;
		for (const unparseComponent of components) {
			try {
				const unknownComponent = z
					.object({
						type: z.string(),
						components: z.unknown().array().default([]),
					})
					.passthrough()
					.parse(unparseComponent);
				if (unknownComponent.type in layoutComponent) {
					const component =
						layoutComponent[unknownComponent.type].parse(unknownComponent);
					if (Object.hasOwn(component, "id")) {
						component.id = count;
					}

					if (
						Object.hasOwn(component, "components") &&
						component.components.length > 0
					) {
						component.components = ThemeLayout.validateRecursive(
							component.components
						);
					}

					count += 1;
					result.push(component);
				}
			} catch (err) {
				error = err;
				break;
			}
		}

		if (error !== null) {
			throw error;
		}

		return result;
	},
	validate: (components) => {
		let ok = true;
		let message = "";
		let componentsResult: unknown[] = [];

		try {
			componentsResult = ThemeLayout.validateRecursive(components);
		} catch (err) {
			ok = false;
			message = `${err}`;
		}

		return {
			ok,
			message,
			components: componentsResult,
		};
	},

	data: [],
	setData: (val) => {
		ThemeLayout.data = val;
	},
};

export default ThemeLayout;
