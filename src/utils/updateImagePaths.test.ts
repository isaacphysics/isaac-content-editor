import { Content, Figure } from "../isaac-data-types";
import { updateImagePaths } from "./updateImagePaths";

describe.only("updateImagePaths", () => {
    describe("error cases", () => {
        it("throws on invalid JSON", () => {
            expect(() => updateImagePaths("not json", p1, p2))
                .toThrow("updateImagePaths: content is not valid JSON");
        });

        it("throws when old and new paths are the same", () => {
            expect(() => subject(empty, p1, p1))
                .toThrow("updateImagePaths: old and new paths are the same");
        });
    });

    it("returns an empty document unchanged", () => {
        const result = subject(empty, p1, p2);
        expect(result).toEqual(empty);
    });

    describe("relative path construction", () => {
        it("no change when moved within directory", () => {
            const fig = figure("figures/foo.svg");
            const result = subject(fig, "a/b/old.json", "a/b/new.json");
            expect(result).toEqual(fig);
        });

        it("rewrites src when moved to sibling", () => {
            const fig = figure("figures/foo.svg");
            const result = subject(fig, "a/b/file.json", "a/c/file.json");
            expect(result) .toEqual({ ...fig, src: "../b/figures/foo.svg" });
        });

        it("rewrites src when moved up", () => {
            const fig = figure("figures/foo.svg");
            const result = subject(fig, "a/b/file.json", "a/file.json");
            expect(result).toEqual({ ...fig, src: "b/figures/foo.svg" });
        });

        it("rewrites src when moved to subfolder of sibling", () => {
            const fig = figure("figures/foo.svg");
            const result = subject(fig, "a/file.json", "b/d/file.json");
            expect(result).toEqual({ ...fig, src: "../../a/figures/foo.svg" });
        });

        it("rewrites src when moved to root", () => {
            const fig = figure("figures/foo.svg");
            const result = subject(fig, "a/file.json", "file.json");
            expect(result).toEqual({ ...fig, src: "a/figures/foo.svg" });
        });

        it("rewrites src when moved from root", () => {
            const fig = figure("figures/foo.svg");
            const result = subject(fig, "file.json", "a/file.json");
            expect(result).toEqual({ ...fig, src: "../figures/foo.svg" });
        });
    });
});

const subject = (doc: Content, oldPath: string, newPath: string): Content =>
    JSON.parse(updateImagePaths(JSON.stringify(doc, null, 2), oldPath, newPath)) as Content;

const empty = {} as Content;
const figure = (src: string): Figure => ({ type: "figure", src });
const p1 = "a/b/file.json";
const p2 = "a/c/file.json";
