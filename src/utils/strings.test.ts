import { extname, getRelativePath } from "./strings";

describe("getRelativePath", () => {
    ([
        ["a", "a/b/figures/foo.svg", "b/figures/foo.svg"],
        ["a/b", "a/b/figures/foo.svg", "figures/foo.svg"],
        ["a/b/c", "a/b/figures/foo.svg", "../figures/foo.svg"],
        ["", "figures/foo.svg", "figures/foo.svg"],
    ] as const).forEach(([base, target, relPath]) => {
        it(`works for ${base}, ${target}, ${relPath}`, () => {
            expect(getRelativePath(base, target)).toBe(relPath);
        });
    });
});

describe("extname", () => {
    ([
        ["", ""],
        ["a", ""],
        [".gitignore", ""],
        ["../a", ""],
        ["./a", ""],
        ["../a.json", ".json"],
        ["./a.json", ".json"],
        [".eslintrc.json", ".json"],
        ["a.json", ".json"],
        ["a.svg", ".svg"],
        ["a.tar.gz", ".gz"],
        ["A.SVG", ".SVG"],
    ] as const).forEach(([path, expectedExtName]) => {
        it(`returns ${expectedExtName} for ${path}`, () => {
            expect(extname(path)).toBe(expectedExtName);
        });
    });
});
