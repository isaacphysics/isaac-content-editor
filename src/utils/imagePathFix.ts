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

    const oldDirName = oldDir.split("/").at(-1);
    if (typeof doc.src === "string") {
        doc.src = `../${oldDirName}/${doc.src}`;
    }
    return JSON.stringify(doc, null, 2);
};
