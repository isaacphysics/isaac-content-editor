import zip from "lodash/zip";
import takeWhile from "lodash/takeWhile";
import drop from "lodash/drop";
import { Content } from "../isaac-data-types";
import { dirname } from "./strings";

export const updateImagePaths = (content: string, oldPath: string, newPath: string): string => {
    if (oldPath === newPath) {
        throw `updateImagePaths: old and new paths are the same (${oldPath})`;
    }

    let doc: Content;
    try {
        doc = JSON.parse(content) as Content;
    } catch {
        throw `updateImagePaths: content is not valid JSON`;
    }

    if (dirname(oldPath) === dirname(newPath)) {
        return content;
    }

    if (typeof doc.src === "string") {
        doc.src = rewriteSrc(doc.src, oldPath, newPath);
    }
    return JSON.stringify(doc, null, 2);
};


const rewriteSrc = (src: string, oldPath: string, newPath: string): string => {
    const oldDirParts = oldPath.split("/").slice(0, -1);
    const newDirParts = newPath.split("/").slice(0, -1);

    const commonPrefix = takeWhile(zip(oldDirParts, newDirParts), ([a, b]) => a === b);
    const oldDirTail = drop(oldDirParts, commonPrefix.length);
    const ups = new Array(newDirParts.length - commonPrefix.length).fill("..");
    return [...ups, ...oldDirTail, src].join("/");
};
