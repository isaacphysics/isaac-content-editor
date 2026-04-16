import { Content, Figure } from "../isaac-data-types";
import { fixImagePaths } from "./imagePathFix";

describe.only("fixImagePaths", () => {
    describe("error cases", () => {
        it("throws on invalid JSON", () => {
            expect(() => fixImagePaths("not json", p1, p2))
                .toThrow("fixImagePaths: content is not valid JSON");
        });

        it("throws when old and new paths are the same", () => {
            expect(() => subject(empty, p1, p1))
                .toThrow("fixImagePaths: old and new paths are the same");
        });
    });

    it("returns an empty document unchanged", () => {
        const result = subject(empty, p1, p2);
        expect(result).toEqual(empty);
    });

    it("rewrites a figure src when the file moves to a sibling directory", () => {
        const fig = figure("figures/foo.svg");
        const result = subject(fig, "a/b/file.json", "a/c/file.json");
        expect(result) .toEqual({ ...fig, src: "../b/figures/foo.svg" });
    });
});

const subject = (doc: Content, oldPath: string, newPath: string): Content =>
    JSON.parse(fixImagePaths(JSON.stringify(doc, null, 2), oldPath, newPath)) as Content;

const empty = {} as Content;
const figure = (src: string): Figure => ({ type: "figure", src });
const p1 = "a/b/file.json";
const p2 = "a/c/file.json";
