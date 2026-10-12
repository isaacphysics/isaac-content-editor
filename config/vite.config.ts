import { defineConfig, type Plugin } from 'vite';

/*function nearleyPlugin(): Plugin {
    return {
        name: 'nearley-loader',

        transform(source, id) {
            if (!id.endsWith('.nearley')) {
                return null;
            }

            // Nearley grammar compilation should be handled by
            // nearleyc or a compatible compiler API.
            return {
                code: `export default ${JSON.stringify(source)};`,
                map: null,
            };
        },
    };
}*/

export default defineConfig({
    plugins: [], //nearleyPlugin()],

    resolve: {
        extensions: [
            '.mjs',
            '.js',
            '.ts',
            '.jsx',
            '.tsx',
            '.json',
            '.nearley',
        ],
    },

    server: {
        open: true,
        port: 8421,
    }
});
