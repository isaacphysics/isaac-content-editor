import { useCallback, useContext, useRef } from "react";
import { Content, ContentBase, IsaacQuestionBase } from "../isaac-data-types";
import { generateGuid } from "./strings";
import { AccordionContext } from "../isaac/IsaacTypes";
import { QuestionTypes } from "../components/semantic/presenters/questionPresenters";
import { convertNumberToRoman } from "cr-numeral";

export const generate = Symbol("generate id") as unknown as string;

let keyBase = 0;
const createKey = (_: unknown, index: number) => `@${index}: ${++keyBase}`;
const UNINITIALISED = [] as string[];

export const formatTabIndex = (index: number, format?: "numeric" | "alphabetical") => {
    if (format === "alphabetical") {
        return String.fromCharCode(65 + index % 26);
    }
    return index + 1;
};

const modifyContentId = (newContent: ContentBase) => {
    if (newContent.id === generate) {
        newContent.id = generateGuid();
        if (newContent.type === "isaacQuizSection") {
            newContent.id = newContent.id?.substring(0, 8);
        }
        if (newContent.type === "item" || newContent.type === "parsonsItem") {
            newContent.id = newContent.id?.substring(0, 4);
        }
    }
};

const modifyTitle = (newContent: ContentBase, newDoc: Content, index: number, questionCount: number) => {
    const contentType = newContent.type || "";
    if (contentType in QuestionTypes || contentType === "inlineQuestionPart") {
        const newQuestion = newContent as IsaacQuestionBase;
        if (!newQuestion.title) {
            newQuestion.title = `${formatTabIndex(index, "alphabetical")}${questionCount ? `.${convertNumberToRoman(questionCount + 1).toLowerCase()}` : ""}`;
        }

        // If the first question in the accordion had the title e.g. A, now convert it to A.i
        if (newDoc.children) {
            for (const child of newDoc.children) {
                const childContent = child.type || "";
                if (childContent in QuestionTypes || childContent === "inlineQuestionPart") {
                    const oldQuestion = child as IsaacQuestionBase;
                    if (oldQuestion.title === formatTabIndex(index, "alphabetical")) {
                        oldQuestion.title = `${formatTabIndex(index, "alphabetical")}.i`;
                    }
                    break;
                }
            }
        }
    }
};

export function useKeyedList<T, D>(items: T[] | undefined, deriveNewList: () => [D, T[]], update: (newDoc: D, invertible?: boolean) => void) {
    const keyList = useRef(UNINITIALISED);
    if (keyList.current === UNINITIALISED) {
        // We only want to do this pre-mount, and then we manually keep this up to date after that.
        keyList.current = items?.map(createKey) ?? [];
    }
    
    const { accordionIndex, questionCount } = useContext(AccordionContext);

    return {
        insert: useCallback((index: number, newElement: T) => {
            const newContent = newElement as ContentBase;
            modifyContentId(newContent);
            
            const [newDoc, newList] = deriveNewList();
            modifyTitle(newContent, newDoc, accordionIndex, questionCount.get(accordionIndex) || 0);
            newList.splice(index, 0, newElement);
            keyList.current.splice(index, 0, createKey(newElement, index));

            update(newDoc);
        }, [accordionIndex, deriveNewList, questionCount, update]),
        insertMultiple: useCallback((elements: [number, T][]) => {
            // Calling insert() multiple times before update() can modify the doc (each render?) will overwrite previous changes. Prefer this.
            const [newDoc, newList] = deriveNewList();
            elements.forEach(([index, newElement]) => {
                modifyContentId(newElement as ContentBase);
                modifyTitle(newElement as ContentBase, accordionIndex, (questionCount.get(accordionIndex) || 0) + index);
                newList.splice(index, 0, newElement);
                keyList.current.splice(index, 0, createKey(newElement, index));
            });
            update(newDoc);
        }, [accordionIndex, deriveNewList, questionCount, update]),
        remove: useCallback((index: number) => {
            const [newDoc, newList] = deriveNewList();
            newList.splice(index, 1);
            keyList.current.splice(index, 1);
            update(newDoc, true);
        }, [deriveNewList, update]),
        shiftBy: useCallback((index: number, amount: number) => {
            const [newDoc, newList] = deriveNewList();
            const [d] = newList.splice(index, 1);
            const [k] = keyList.current.splice(index, 1);
            newList.splice(index + amount, 0, d);
            keyList.current.splice(index, 0, k);
            update(newDoc);
        }, [deriveNewList, update]),
        updateChild: useCallback((index: number, newValue: T, invertible?: boolean) => {
            const [newDoc, newList] = deriveNewList();
            newList[index] = newValue;
            update(newDoc, invertible);
        }, [deriveNewList, update]),
        keyList: keyList.current,
    };
}

export const useWithIndex = <A extends unknown[], R>(func: (index: number, ...args: A) => R, index: number) => {
    return useCallback((...args: A) => func(index, ...args), [func, index]);
};
