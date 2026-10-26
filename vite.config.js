import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about-1.html'),
        architecture: resolve(__dirname, 'architecture.html'),
        bim: resolve(__dirname, 'bim.html'),
        bridge: resolve(__dirname, 'bridge.html'),
        commerce: resolve(__dirname, 'commerce.html'),
        hydro: resolve(__dirname, 'hydro.html'),
        lab: resolve(__dirname, 'lab.html'),
      },
    },
  },
});
