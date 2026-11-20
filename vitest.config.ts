import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        // No pacote, `@/` aponta para a cópia de desenvolvimento dos primitivos shadcn.
        // No projeto consumidor, aponta para `resources/js`.
        alias: {
            '@': fileURLToPath(new URL('./dev', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/vue/**/*.spec.ts'],
    },
});
