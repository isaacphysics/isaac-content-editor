import {isDefined} from "./types";

export function safeLowercase(label: string | undefined) {
    return label?.replace(/(^|[^a-zA-Z0-9])[A-Z][a-z]/g, (match) => match.toLowerCase());
}

export function generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random()*16|0, v = c === 'x' ? r : ((r&0x3)|0x8);
        return v.toString(16);
    });
}

export function dirname(path: string): string;
export function dirname(path: string | undefined): string | undefined;
export function dirname(path: string | undefined) {
    if (!isDefined(path)) return path;
    return path.slice(0, path.lastIndexOf('/'));
}

export function ext(filename: string | undefined): string | undefined {
    if (!filename) return filename;
    return filename.indexOf('.') ? filename.substring(filename.indexOf('.')) : undefined;
}

export function resolveRelativePath(relativeFilename: string, baseSrcPath: string): string {
    return new URL(relativeFilename, "http://example.org/" + baseSrcPath).pathname.substring(1); // The host name is ignored
}

export function alphabetIndex(index: number): string {
    return String.fromCharCode('A'.charCodeAt(0) + (index % 26));
}
