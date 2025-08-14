import {Content, Figure, IsaacClozeQuestion} from "../isaac-data-types";
import { dropZoneRegex } from "../isaac/IsaacTypes";

export const extractValueOrChildrenText = (doc: Content): string => {
    return (doc.value || doc.children?.map(extractValueOrChildrenText).join("\n")) ?? "";
};

export const extractDropZoneIdsPerFigure = (doc: Content): [string, string[]][]=> {
    return (doc.type === "figure" 
        ? ((doc as Figure).dropZones 
            ? [[doc.id as string, (doc as Figure).dropZones?.map(dz => dz.id) ?? []]] 
            : []) 
        : doc.children?.map(extractDropZoneIdsPerFigure).reduce((a, b) => [...a, ...b], [])
    ) ?? [];
};

// the index is the sum of the number of DZs before the figure
export const extractFigureDropZoneStartIndex = (doc: IsaacClozeQuestion, figureId: string): number => {
    if (!doc.children) return 0;
    let dropZoneStartIndex = 0;
    const flatChildren = doc.children.flat();
    for (const child of flatChildren) {
        if (child.type === "figure" && child.id === figureId) return dropZoneStartIndex;
        
        const valueMatches = (child as Content).value?.matchAll(dropZoneRegex);
        dropZoneStartIndex += valueMatches ? Array.from(valueMatches).length : 0;

        if (child.type === "figure") {
            const dropZones = (child as Figure).dropZones;
            dropZoneStartIndex += dropZones ? dropZones.length : 0;
        }
    }

    return 0;
}
