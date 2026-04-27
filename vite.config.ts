import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'path';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: path.resolve(__dirname),         // корень проекта
  publicDir: 'public',                   // статические файлы (favicon, manifest)
  build: {
    outDir: 'dist-single',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // ваш HTML с точкой входа
    },
  },
});