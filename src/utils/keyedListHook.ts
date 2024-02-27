import { useCallback, useRef } from "react";

import { ContentBase } from "../isaac-data-types";

import { generateGuid } from "./strings";

export const generate = Symbol("generate id") as unknown as string;

let keyBase = 0;
const createKey = (_: unknown, index: number) => `@${index}: ${++keyBase}`;
const UNINITIALISED = [] as string[];

export function useKeyedList<T, D>(
  items: T[] | undefined,
  deriveNewList: () => [D, T[]],
  update: (newDoc: D, invertible?: boolean) => void,
) {
  const keyList = useRef(UNINITIALISED);
  if (keyList.current === UNINITIALISED) {
    // We only want to do this pre-mount, and then we manually keep this up to date after that.
    keyList.current = items?.map(createKey) ?? [];
  }

  return {
    insert: useCallback(
      (index: number, newElement: T) => {
        const newContent = newElement as ContentBase;
        if (newContent.id === generate) {
          newContent.id = generateGuid();
          if (newContent.type === "isaacQuizSection") {
            newContent.id = newContent.id?.substring(0, 8);
          }
          if (newContent.type === "item" || newContent.type === "parsonsItem") {
            newContent.id = newContent.id?.substring(0, 4);
          }
        }
        const [newDoc, newList] = deriveNewList();
        newList.splice(index, 0, newElement);
        keyList.current.splice(index, 0, createKey(newElement, index));
        update(newDoc);
      },
      [deriveNewList, update],
    ),
    remove: useCallback(
      (index: number) => {
        const [newDoc, newList] = deriveNewList();
        newList.splice(index, 1);
        keyList.current.splice(index, 1);
        update(newDoc, true);
      },
      [deriveNewList, update],
    ),
    shiftBy: useCallback(
      (index: number, amount: number) => {
        const [newDoc, newList] = deriveNewList();
        const [d] = newList.splice(index, 1);
        const [k] = keyList.current.splice(index, 1);
        newList.splice(index + amount, 0, d);
        keyList.current.splice(index, 0, k);
        update(newDoc);
      },
      [deriveNewList, update],
    ),
    updateChild: useCallback(
      (index: number, newValue: T, invertible?: boolean) => {
        const [newDoc, newList] = deriveNewList();
        newList[index] = newValue;
        update(newDoc, invertible);
      },
      [deriveNewList, update],
    ),
    keyList: keyList.current,
  };
}

export const useWithIndex = <A extends unknown[], R>(func: (index: number, ...args: A) => R, index: number) => {
  return useCallback((...args: A) => func(index, ...args), [func, index]);
};
