import { createContext } from "react";
import {DndItem, Item} from "../isaac-data-types";

export interface BooleanNotation {
    ENG?: boolean;
    MATH?: boolean;
}

export const NON_STATIC_FIGURE_FLAG = "NON_STATIC_FIGURE";
export interface FigureNumbersById {[figureId: string]: number | typeof NON_STATIC_FIGURE_FLAG | undefined}
export const FigureNumberingContext = createContext<FigureNumbersById>({});

export const NULL_CLOZE_ITEM_ID = "NULL_CLOZE_ITEM" as const;
export const NULL_CLOZE_ITEM: Item = {
    type: "item",
    id: NULL_CLOZE_ITEM_ID
};
export const NULL_DND_ITEM_ID = "NULL_DND_ITEM" as const;
export const NULL_DND_ITEM: DndItem = {
    type: "dndItem",
    id: NULL_DND_ITEM_ID,
    dropZoneId: "NULL_DROP_ZONE"
};
// Matches: [drop-zone], [drop-zone|w-50], [drop-zone|h-50] or [drop-zone|w-50h-200]
export const dropZoneRegex = /\[drop-zone(?<params>\|(?<index>i-\d+?)?(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;

export const dndDropZoneMissingIdRegex = /\[drop-zone([^:].*)?\]/g;
export const dndDropZoneRegex = /\[drop-zone:(?<id>[a-zA-Z0-9_-]+)(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?\]/g;

export const inlineQuestionRegex = /\[inline-question:(?<id>[a-zA-Z0-9_-]+)(?<params>(\|(?<width>w-\d+?)?(?<height>h-\d+?)?| class="(?<classes>.*?)"))?\]/g;
