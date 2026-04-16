import zip from "lodash/zip";
import takeWhile from "lodash/takeWhile";
import drop from "lodash/drop";
import { Content, Figure } from "../isaac-data-types";
import { dirname } from "./strings";

export const updateImagePaths = (content: string, oldPath: string, newPath: string): string => {
    if (oldPath === newPath) {
        throw `updateImagePaths: old and new paths are the same (${oldPath})`;
    }

    if (dirname(oldPath) === dirname(newPath)) {
        return content;
    }

    let doc: Content;
    try {
        doc = JSON.parse(content) as Content;
    } catch {
        throw `updateImagePaths: content is not valid JSON`;
    }

    const updated = updateImagePathsContent(doc, oldPath, newPath);
    return JSON.stringify(updated, null, 2);
};

const updateImagePathsContent = (content: Content | Content[], oldPath: string, newPath: string): Content | Content[] => {
    if (Array.isArray(content)) {
        return content.map(c => updateImagePathsContent(c, oldPath, newPath)) as Content[];
    }
    if (content.children) {
        return {...content, children: updateImagePathsContent(content.children as Content[], oldPath, newPath)} as Content;
    }
    if (isFigure(content) && content.src) {
        return {...content, src: updatePath(content.src, oldPath, newPath)} as Figure;
    }
    return content;
};

const updatePath = (str: string, oldPath: string, newPath: string): string => {
    const oldDirParts = oldPath.split("/").slice(0, -1);
    const newDirParts = newPath.split("/").slice(0, -1);

    const commonPrefix = takeWhile(zip(oldDirParts, newDirParts), ([a, b]) => a === b);
    const oldDirTail = drop(oldDirParts, commonPrefix.length);
    const ups = new Array(newDirParts.length - commonPrefix.length).fill("..");
    return [...ups, ...oldDirTail, str].join("/");
};

const isFigure = (content: Content): content is Figure => content.type === 'figure';

