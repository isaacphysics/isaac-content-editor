import zip from "lodash/zip";
import takeWhile from "lodash/takeWhile";
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

// a (naive) in-browser implementation that attempts to mimic the interface and
// behavior of path.extname, meaning this function's test suite should also pass
// for path.extname.
export function extname(pth: string): string | null {
    const fileName = pth.split('/').reverse()[0];
    const parts = fileName.split('.').filter(s => s != '');
    return parts.length <= 1 ? "" : `.${parts.reverse()[0]}`;
}


export function resolveRelativePath(relativeFilename: string, baseSrcPath: string): string {
    return new URL(relativeFilename, "http://example.org/" + baseSrcPath).pathname.substring(1); // The host name is ignored
}

export function alphabetIndex(index: number): string {
    return String.fromCharCode('A'.charCodeAt(0) + (index % 26));
}

export function getRelativePath(base: string, target: string): string {
    const [baseParts, targetParts] = [base.split('/').filter(str => str !== ''), target.split('/')];

    const sharedPrefix = takeWhile(zip(baseParts, targetParts), ([a, b]) => a === b);
    const tail = targetParts.slice(sharedPrefix.length);
    const ups = new Array(baseParts.length - sharedPrefix.length).fill("..");

    return [...ups, ...tail].join("/");
}
