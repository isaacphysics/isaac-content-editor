import { defineConfig } from 'vite';
import { nearleyPlugin } from './nearleyPlugin';

export default defineConfig({
    plugins: [nearleyPlugin()],

    server: {
        open: true,
        port: 8421,
    },

    build: {
        outDir: "build",
    }
});
