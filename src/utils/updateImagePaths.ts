import isPlainObject from "lodash/isPlainObject";
import { Content, Figure, Image } from "../isaac-data-types";
import { dirname, relativePath, resolveRelativePath } from "./strings";

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
    if ((isFigure(content) || isImage(content)) && content.src) {
        return {...content, src: updatePath(content.src, oldPath, newPath)} as Content;
    }
    if (isPlainObject(content)) {
        return Object.fromEntries(Object.entries(content).map(([k, v]) => [k, updateImagePathsContent(v, oldPath, newPath)]));
    }
    return content;
};

const updatePath = (oldRelativeResourcePath: string, oldHostPath: string, newHostPath: string): string => {
    return relativePath(
        newHostPath.split('/').slice(0, -1).join('/'),
        resolveRelativePath(oldRelativeResourcePath, oldHostPath)
    );
};

const isFigure = (content: Content): content is Figure => content.type === 'figure';
const isImage = (content: Content): content is Image => content.type === 'image';

