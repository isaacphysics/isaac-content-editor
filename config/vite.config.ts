import { defineConfig } from 'vite';
import { nearleyPlugin } from './nearleyPlugin.ts';

export default defineConfig({
    plugins: [nearleyPlugin()],

    server: {
        open: true,
        port: 8421,
    }
});
