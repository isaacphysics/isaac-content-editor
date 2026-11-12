import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { nearleyPlugin } from './nearleyPlugin.ts';

export default defineConfig({
    plugins: [
        nearleyPlugin(),
        checker({ typescript: true }),
    ],

    server: {
        open: true,
        port: 8421,
    },

    build: {
        outDir: "build",
    }
});
