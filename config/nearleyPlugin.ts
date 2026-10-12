import type { Plugin } from 'vite';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function nearleyPlugin(): Plugin {
  return {
    name: 'vite-plugin-nearley',

    async transform(_source, id) {
      const file = id.split('?')[0];

      if (!file.endsWith('.nearley')) {
        return null;
      }

      const { readFile } = await import('node:fs/promises');
      const source = await readFile(file, 'utf8');

      const nearley = require('nearley');
      const compile = require('nearley/lib/compile');
      const generate = require('nearley/lib/generate');
      const nearleyGrammar = require(
        'nearley/lib/nearley-language-bootstrapped',
      );

      const parser = new nearley.Parser(nearleyGrammar);
      parser.feed(source);

      const grammarAst = parser.results[0];
      const compiled = compile(grammarAst, {});
      const js = generate(compiled, 'grammar');

      // Replace the CommonJS moo import in the grammar header.
      const transformedJs = js.replace(
        /const moo = require\(["']moo["']\);?/,
        'const moo = globalThis.__nearleyMoo;',
      );

      const code = `
        import * as mooModule from 'moo';

        globalThis.__nearleyMoo = mooModule.default ?? mooModule;

        const module = { exports: {} };
        const exports = module.exports;

        ${transformedJs}

        export default module.exports;
      `;

      return {
        code,
        map: null,
      };
    },
  };
}
