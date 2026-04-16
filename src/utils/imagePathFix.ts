import zip from "lodash/zip";
import takeWhile from "lodash/takeWhile";
import { Content } from "../isaac-data-types";
import { dirname } from "./strings";

export const fixImagePaths = (content: string, oldPath: string, newPath: string): string => {
    if (oldPath === newPath) {
        throw `fixImagePaths: old and new paths are the same (${oldPath})`;
    }

    let doc: Content;
    try {
        doc = JSON.parse(content) as Content;
    } catch {
        throw `fixImagePaths: content is not valid JSON`;
    }

    const oldDir = dirname(oldPath);
    const newDir = dirname(newPath);

    if (oldDir === newDir) {
        return content;
    }

    if (typeof doc.src === "string") {
        doc.src = rewriteSrc(doc.src, oldDir, newDir);
    }
    return JSON.stringify(doc, null, 2);
};


function rewriteSrc(src: string, oldDir: string, newDir: string): string {
    const oldDirParts = oldDir.split("/");
    const newDirParts = newDir.split("/");

    const commonPrefix = takeWhile(zip(oldDirParts, newDirParts), ([a, b]) => a === b);

    const ups = Array(newDirParts.length - commonPrefix.length).fill("..");
    const oldDirTail = oldDirParts.slice(commonPrefix.length);
    return [...ups, ...oldDirTail, src].join("/");
}