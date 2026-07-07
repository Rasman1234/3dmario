import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3011,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
