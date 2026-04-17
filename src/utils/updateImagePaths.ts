import zip from "lodash/zip";
import takeWhile from "lodash/takeWhile";
import { Content, Figure, Image } from "../isaac-data-types";
import { dirname, nonEmpty, resolveRelativePath } from "./strings";

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
    if ((isFigure(content) || isImage(content)) && content.src) {
        return {...content, src: updatePath(content.src, oldPath, newPath)} as Figure;
    }
    return content;
};

const updatePath = (oldRelativeResourcePath: string, oldHostPath: string, newHostPath: string): string => {
    return relative(
        newHostPath.split('/').slice(0, -1).join('/'),
        resolveRelativePath(oldRelativeResourcePath, oldHostPath)
    );
};

export const relative = (base: string, target: string): string => {
    const [baseParts, targetParts] = [base.split('/').filter(nonEmpty), target.split('/')];

    const sharedPrefix = takeWhile(zip(baseParts, targetParts), ([a, b]) => a === b);
    const tail = targetParts.slice(sharedPrefix.length);
    const ups = new Array(baseParts.length - sharedPrefix.length).fill("..");

    return [...ups, ...tail].join("/");
};

const isFigure = (content: Content): content is Figure => content.type === 'figure';
const isImage = (content: Content): content is Image => content.type === 'image';

