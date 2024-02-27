import { useRef } from "react";

import { ChoiceQuestion, Content, Question } from "../isaac-data-types";
import { NON_STATIC_FIGURE_FLAG } from "./IsaacTypes";

export function extractFigureId(id: string) {
  return id.replace(/.*?([^|]*)$/g, "$1");
}

export const useFigureNumbering = (doc: Content) => {
  const figureMap = useRef<Record<string, number | typeof NON_STATIC_FIGURE_FLAG | undefined>>({});

  const newMap = {} as Record<string, number | typeof NON_STATIC_FIGURE_FLAG | undefined>;
  let n = 1;
  function walk(d: Content | Question | ChoiceQuestion | undefined, outOfStaticFlow: boolean) {
    if (!d) {
      // Nothing to see here. Move along.
      return;
    } else if (d.type === "figure" && d.id) {
      const figureId = extractFigureId(d.id);
      if (!Object.keys(newMap).includes(figureId) || newMap[figureId] === NON_STATIC_FIGURE_FLAG) {
        newMap[figureId] = outOfStaticFlow ? NON_STATIC_FIGURE_FLAG : n++;
      }
    } else {
      // Walk all the things that might possibly contain figures. Doesn't blow up if they don't exist.
      if (Array.isArray(d.children)) {
        for (const c of d.children) {
          walk(c, outOfStaticFlow);
        }
      }
      if (typeof d === "object" && "answer" in d) {
        walk(d.answer, outOfStaticFlow);
        for (const h of d.hints || []) {
          walk(h, outOfStaticFlow);
        }
        // Walk figures in question choices and feedback, marking them as being out of the static document flow
        if ("choices" in d) {
          for (const c of d.choices || []) {
            walk(c.explanation, true);
          }
        }
        walk(d.defaultFeedback, true);
      }
      // If we find that some figures aren't getting numbers, add additional walks here to find them.
    }
  }
  walk(doc, false);

  // Check maps match, or update ref if they do not.
  const oldMap = figureMap.current;
  const newKeys = Object.keys(newMap);
  const oldKeys = Object.keys(oldMap);
  if (
    newKeys.length !== oldKeys.length ||
    !newKeys.every((key) => {
      return newMap[key] === oldMap[key];
    })
  ) {
    figureMap.current = newMap;
  }

  return figureMap.current;
};
