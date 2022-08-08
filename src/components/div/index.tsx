import { type TThemeLayoutComponentDiv } from "electron/main/theme/layout/components/div";
import { type TThemeLayoutComponentKeyHistory } from "electron/main/theme/layout/components/keyHistory";
import { type TThemeLayoutComponentKeyCodes } from "electron/main/theme/layout/components/keyCodes";
import { type TThemeLayoutComponentKeyValues } from "electron/main/theme/layout/components/keyValues";
import { type TThemeLayoutComponentMouseButtons } from "electron/main/theme/layout/components/mouseButtons";
import { type TThemeLayoutComponentMouseWheel } from "electron/main/theme/layout/components/mouseWheel";
import { type TThemeLayoutComponentMouseMove } from "electron/main/theme/layout/components/mouseMove";
import { type FC, type ReactNode } from "react";

import ComponentKeyHistory from "../keyHistory";
import ComponentKeyCodes from "../keyCodes";
import ComponentKeyValues from "../keyValues";
import ComponentMouseButtons from "../mouseButtons";
import ComponentMouseWheel from "../mouseWheel";
import ComponentMouseMove from "../mouseMove";

const ComponentDiv: FC<TThemeLayoutComponentDiv> = ({
	className,
	components,
	text,
}) => {
	const nodes: ReactNode[] = [];
	for (const unparseComponent of components ?? []) {
		if (
			unparseComponent instanceof Object &&
			!(unparseComponent instanceof Array)
		) {
			if (Object.hasOwn(unparseComponent, "type")) {
				const typeComponent = unparseComponent as { type: string; id: number };
				switch (typeComponent.type ?? "") {
					case "div":
						nodes.push(
							<ComponentDiv
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentDiv)}
							/>
						);
						break;
					case "keyHistory":
						nodes.push(
							<ComponentKeyHistory
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentKeyHistory)}
							/>
						);
						break;
					case "keyValues":
						nodes.push(
							<ComponentKeyValues
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentKeyValues)}
							/>
						);
						break;
					case "keyCodes":
						nodes.push(
							<ComponentKeyCodes
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentKeyCodes)}
							/>
						);
						break;
					case "mouseButtons":
						nodes.push(
							<ComponentMouseButtons
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentMouseButtons)}
							/>
						);
						break;
					case "mouseWheel":
						nodes.push(
							<ComponentMouseWheel
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentMouseWheel)}
							/>
						);
						break;
					case "mouseMove":
						nodes.push(
							<ComponentMouseMove
								key={typeComponent.id}
								{...(typeComponent as TThemeLayoutComponentMouseMove)}
							/>
						);
						break;
					default:
						break;
				}
			}
		}
	}

	return <div className={className}>{(nodes.length > 0 && nodes) || text}</div>;
};

export default ComponentDiv;
