const nearley = require("nearley");
const compile = require("nearley/lib/compile");
const generate = require("nearley/lib/generate");
const nearleyGrammar = require("nearley/lib/nearley-language-bootstrapped");

module.exports = {
    process(sourceText) {
        const parser = new nearley.Parser(nearleyGrammar);
        parser.feed(sourceText);

        const grammarAst = parser.results[0];
        const compiled = compile(grammarAst, {});
        const js = generate(compiled, "grammar");

        // Generated Nearley code is CommonJS.
        return {
            code: js,
        };
    },
};
