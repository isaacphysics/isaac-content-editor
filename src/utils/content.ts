import {Content, Figure, IsaacClozeQuestion} from "../isaac-data-types";
import { dropZoneRegex } from "../isaac/IsaacTypes";

export const extractValueOrChildrenText = (doc: Content): string => {
    return (doc.value || doc.children?.map(extractValueOrChildrenText).join("\n")) ?? "";
};

export const extractDropZoneIdsPerFigure = (doc: Content): [string, string[]][]=> {
    return (doc.type === "figure" 
        ? ((doc as Figure).figureRegions 
            ? [[doc.id as string, (doc as Figure).figureRegions?.map(dz => dz.id) ?? []]] 
            : []) 
        : doc.children?.map(extractDropZoneIdsPerFigure).reduce((a, b) => [...a, ...b], [])
    ) ?? [];
};

// the index is the sum of the number of DZs before the figure
export const extractFigureRegionStartIndex = (doc: IsaacClozeQuestion, figureId: string): number => {
    if (!doc.children) return 0;
    let figureRegionStartIndex = 0;
    const flatChildren = doc.children.flat();
    for (const child of flatChildren) {
        if (child.type === "figure" && child.id === figureId) return figureRegionStartIndex;
        
        const valueMatches = (child as Content).value?.matchAll(dropZoneRegex);
        figureRegionStartIndex += valueMatches ? Array.from(valueMatches).length : 0;

        if (child.type === "figure") {
            const figureRegions = (child as Figure).figureRegions;
            figureRegionStartIndex += figureRegions ? figureRegions.length : 0;
        }
    }

    return 0;
};
