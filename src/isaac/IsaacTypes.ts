import { createContext } from "react";
import { Item } from "../isaac-data-types";

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

export const DND_ITEM_TYPE = "dndItem";
// Matches: [drop-zone], [drop-zone|i-1], [drop-zone|w-50], [drop-zone|h-200], [drop-zone|w-50h-200], [drop-zone|i-1w-50h-200], [drop-zone|altText="some text"], [drop-zone|i-1w-50h-200|altText="some text"]
export const dropZoneRegex = /\[drop-zone(?<params>(\|(?<index>i-\d+?)?(?<width>w-\d+?)?(?<height>h-\d+?)?)?(\|altText="(?<altText>.*)")?)?]/g;

export const dndDropZoneMissingIdRegex = /\[drop-zone([^:].*)?\]/g;
// Matches [drop-zone:id], [drop-zone:id|w-50], [drop-zone:id|h-200], [drop-zone:id|w-50h-200], [drop-zone:id|altText="some text"], [drop-zone:id|w-50h-200|altText="some text"]
export const dndDropZoneRegex = /\[drop-zone:(?<id>[a-zA-Z0-9_-]+)(?<params>(\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?(\|altText="(?<altText>.*?)")?)?\]/g;

// Matches: [inline-question:id], [inline-question:id|w-50], [inline-question:id|h-200], [inline-question:id|w-50h-200], [inline-question:id class="some-class"], and NOT [inline-question:id|w-50h-200 class="some-class"]
export const inlineQuestionRegex = /\[inline-question:(?<id>[a-zA-Z0-9_-]+)(?<params>(\|(?<width>w-\d+?)?(?<height>h-\d+?)?| class="(?<classes>.*?)"))?\]/g;
