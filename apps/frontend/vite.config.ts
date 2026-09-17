import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        authors: resolve(import.meta.dirname, 'pages/authors.html'),
        books: resolve(import.meta.dirname, 'pages/books.html'),
        emprunts: resolve(import.meta.dirname, 'pages/emprunts.html'),
        membres: resolve(import.meta.dirname, 'pages/membres.html'),
      },
    },
  },
});
