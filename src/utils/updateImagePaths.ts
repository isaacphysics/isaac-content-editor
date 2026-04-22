import isPlainObject from "lodash/isPlainObject";
import { Content, Figure, Image } from "../isaac-data-types";
import { getRelativePath, resolveRelativePath } from "./strings";

export const updateImagePaths = (content: string, oldPath: string, newPath: string): string => {
    if (oldPath === newPath) {
        throw `updateImagePaths: old and new paths are the same (${oldPath})`;
    }
    if (directory(oldPath) === directory(newPath)) {
        return content;
    }

    const updated = updateImagePathsContent(decode(content), oldPath, newPath);
    return JSON.stringify(updated, null, 2);
};

const decode = (content: string): Content => {
    try {
        return JSON.parse(content) as Content;
    } catch {
        throw `updateImagePaths: content is not valid JSON`;
    }
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
    if (['/assets/', 'http://', 'https://'].some(str => oldRelativeResourcePath.startsWith(str))) {
        return oldRelativeResourcePath;
    }
    return getRelativePath(directory(newHostPath), resolveRelativePath(oldRelativeResourcePath, oldHostPath));
};

const directory = (path: string): string => path.split('/').slice(0, -1).join('/');
export const isFigure = (maybeFigure: unknown): maybeFigure is Figure => typeof maybeFigure === 'object' &&
    maybeFigure !== null && 'type' in maybeFigure && maybeFigure.type === 'figure';
const isImage = (maybeImage: unknown): maybeImage is Image => typeof maybeImage === 'object' &&
    maybeImage !== null && 'type' in maybeImage && maybeImage.type === 'image';
