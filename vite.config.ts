import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  /**
   * Visto che monterai manualmente JS/CSS da PHP,
   * base './' è la scelta più sicura.
   */
  base: './',

  build: {
    outDir: 'campaigns-embed',
    emptyOutDir: true,

    rollupOptions: {
      output: {
        entryFileNames: 'campaigns-app.js',
        chunkFileNames: 'campaigns-[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'campaigns-app.css';
          }

          return 'campaigns-[name][extname]';
        },
      },
    },
  },
})
