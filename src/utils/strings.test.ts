import { relativePath } from "./strings";

describe("relativePath", () => {
    ([
        ["a", "a/b/figures/foo.svg", "b/figures/foo.svg"],
        ["a/b", "a/b/figures/foo.svg", "figures/foo.svg"],
        ["a/b/c", "a/b/figures/foo.svg", "../figures/foo.svg"],
        ["", "figures/foo.svg", "figures/foo.svg"],
    ] as const).forEach(([base, target, relPath]) => {
        it(`works for ${base}, ${target}, ${relPath}`, () => {
            expect(relativePath(base, target)).toBe(relPath);
        });
    });
});
