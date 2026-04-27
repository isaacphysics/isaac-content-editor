import { Content, ContentBase, Figure, Image, IsaacNumericQuestion } from "../isaac-data-types";
import { isFigure, updateImagePaths } from "./updateImagePaths";

describe("updateImagePaths", () => {
    describe("error cases", () => {
        it("throws on invalid JSON", () => {
            expect(() => updateImagePaths("not json", "a/b/file.json", "a/c/file.json"))
                .toThrow("updateImagePaths: content is not valid JSON");
        });

        it("throws when old and new paths are the same", () => {
            expect(() => testUpdateImagePaths(({}), "a/b/file.json", "a/b/file.json"))
                .toThrow("updateImagePaths: old and new paths are the same");
        });
    });

    it("returns an empty document unchanged", () => {
        const result = testUpdateImagePaths(({}), "a/b/file.json", "a/c/file.json");
        expect(result).toEqual(({}));
    });

    // eg: content/questions/maths/statistics/hypothesis_testing/level3/testing_3_9_r1.json
    it("can update paths on documents with a `null` field", () => {
        const doc = { type: "isaacSymbolicQuestion", children: [makeFigure("/assets/foo.svg")], defaultFeedback: null };
        const result = testUpdateImagePaths(doc, "a/b/old.json", "a/new.json");
        expect(result).toEqual({ type: "isaacSymbolicQuestion", children: [makeFigure("/assets/foo.svg")], defaultFeedback: null });
    });

    describe("path update", () => {
        describe('path types', () => {
            // these are to mirror
            // https://github.com/isaacphysics/isaac-api/blob/8fbc3c1fe3992918083ba65f241bd0449dbbe1e1/src/main/java/uk/ac/cam/cl/dtg/segue/etl/ContentIndexer.java#L544
        
            // eg. content/junior_24/itsp24_lesson_disttime.json
            it("makes no change for '/assets' path", () => {
                const fig = makeFigure("/assets/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/old.json", "a/new.json");
                expect(result).toEqual(fig);
            });

            // couldn't find any good examples
            it("makes no change for http path", () => {
                const fig = makeFigure("http://assets/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/old.json", "a/new.json");
                expect(result).toEqual(fig);
            });

            // couldn't find any good examples
            it("makes no change for https path", () => {
                const fig = makeFigure("https://assets/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/old.json", "a/new.json");
                expect(result).toEqual(fig);
            });

            // content/questions/physics/mechanics/statics/level6/corner_climbing_num.json
            it('treats /-paths as relative', () => {
                const fig = makeFigure("/figures/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/old.json", "a/new.json");
                expect(result).toEqual(makeFigure("../figures/foo.svg"));
            });
        });

        describe('move operation types', () => {
            it("no change when moved within directory", () => {
                const fig = makeFigure("figures/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/old.json", "a/b/new.json");
                expect(result).toEqual(fig);
            });

            it("rewrites src when moved to sibling", () => {
                const fig = makeFigure("figures/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/file.json", "a/c/file.json");
                expect(result).toEqual({ ...fig, src: "../b/figures/foo.svg" });
            });

            it("rewrites src when moved up", () => {
                const fig = makeFigure("figures/foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/file.json", "a/file.json");
                expect(result).toEqual({ ...fig, src: "b/figures/foo.svg" });
            });

            it("rewrites src when moved to subfolder of sibling", () => {
                const fig = makeFigure("figures/foo.svg");
                const result = testUpdateImagePaths(fig, "a/file.json", "b/d/file.json");
                expect(result).toEqual({ ...fig, src: "../../a/figures/foo.svg" });
            });

            it("rewrites src when moved to root", () => {
                const fig = makeFigure("figures/foo.svg");
                const result = testUpdateImagePaths(fig, "a/file.json", "file.json");
                expect(result).toEqual({ ...fig, src: "a/figures/foo.svg" });
            });

            it("rewrites src when moved from root", () => {
                const fig = makeFigure("figures/foo.svg");
                const result = testUpdateImagePaths(fig, "file.json", "a/file.json");
                expect(result).toEqual({ ...fig, src: "../figures/foo.svg" });
            });

            it("rewrites src that already contains ..", () => {
                const fig = makeFigure("../foo.svg");
                const result = testUpdateImagePaths(fig, "a/b/file.json", "a/c/file.json");
                expect(result).toEqual({ ...fig, src: "../foo.svg" });
            });
        });
    });

    describe("descent", () => {
        // eg: content/questions/biology/cell_biology/mitosis/gcse/alternation_of_generations.json
        it("descends into children, maps arrays", () => {
            const doc = { children: [makeFigure("figures/foo.svg")]};
            const result = testUpdateImagePaths(doc, "file.json", "a/file.json");
            expect(result).toEqual({ ...doc, children: [makeFigure("../figures/foo.svg")]});
        });

        // eg: content/books/quantum_mechanics_primer/chapter_1/qmp_ch1_q23.json
        it("descends into explanation", () => {
            const doc = { type: "formula", explanation: { type: "content", children: [makeFigure("figures/foo.svg")]}};
            const result = testUpdateImagePaths(doc, "file.json", "a/file.json");
            expect(result).toEqual({
                type: "formula", explanation: { type: "content", children: [makeFigure("../figures/foo.svg")]}
            });
        });

        // eg: content/NSTIA/SM/nst1A_SR_q23.json
        it("descends into hints", () => {
            const doc = makeNumericQuestion(makeHints(makeContent(makeFigure("figures/foo.svg"))));
            const result = testUpdateImagePaths(doc, "file.json", "a/file.json");
            expect(result).toEqual(makeNumericQuestion(makeHints(makeContent(makeFigure("../figures/foo.svg")))));
        });

        // eg: content/questions/biology/genetics/dna_replication/pentose_sugars.json
        it("descends into inline questions", () => {
            const doc = {type: "isaacInlineRegion", children: [makeFigure("figures/foo.svg")]};
            const result = testUpdateImagePaths(doc, "file.json", "a/file.json");
            expect(result).toEqual({type: "isaacInlineRegion", children: [makeFigure("../figures/foo.svg")]});
        });

        // eg: content/questions/biology/cell_biology/mitosis/gcse/alternation_of_generations.json
        it("descends into drag-and-drop questions", () => {
            const doc = {type: "isaacDndQuestion", children: [makeFigure("figures/foo.svg")]};
            const result = testUpdateImagePaths(doc, "file.json", "a/file.json");
            expect(result).toEqual({type: "isaacDndQuestion", children: [makeFigure("../figures/foo.svg")]});
        });
    });

    describe("modifies content blocks", () => {
        it("updates figure paths", () => {
            const fig = makeFigure("figures/foo.svg");
            const result = testUpdateImagePaths(fig, "file.json", "a/file.json");
            expect(result).toEqual(makeFigure("../figures/foo.svg"));
        });

        it("updates image paths", () => {
            const img = makeImage("figures/foo.svg");
            const result = testUpdateImagePaths(img, "file.json", "a/file.json");
            expect(result).toEqual(makeImage("../figures/foo.svg"));
        });

        // eg: content/books/quantum_mechanics_primer/qmp_intro.json
        // eg (items with images): https://staging.adacomputerscience.org/questions/sort_27
        it("does not update <img> tags within content blocks, as these contain absolute url's", () => {
            const doc = makeContent('<img src="/images/content/pods/figures/mentoring.svg">');
            const result = testUpdateImagePaths(doc, "file.json", "a/file.json");
            expect(result).toEqual(makeContent('<img src="/images/content/pods/figures/mentoring.svg">'));
        });
    });
});

const testUpdateImagePaths = (doc: Content, oldPath: string, newPath: string): Content =>
    JSON.parse(updateImagePaths(JSON.stringify(doc, null, 2), oldPath, newPath)) as Content;

const makeFigure = (src: string): Figure => ({ type: "figure", src });
const makeImage = (src: string): Image => ({ type: "image", src });
const makeNumericQuestion = (hints: ContentBase[]): IsaacNumericQuestion => ({ type: "isaacNumericQuestion", hints });
const makeHints = (content: Content): ContentBase[] => [content];
const makeContent = (val: Figure | string): Content => {
    if (isFigure(val)) {
        return ({ type: "content", children: [val] });
    }
    return { type: "content", value: val};
};
