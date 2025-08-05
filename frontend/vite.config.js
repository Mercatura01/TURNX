import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    environment('all', { prefix: 'CANISTER_' }),
    environment('all', { prefix: 'DFX_' })
  ],
  envDir: '../',
  define: {
    'process.env': process.env
  },
  optimizeDeps: {
    include: [
      '@dfinity/agent',
      '@dfinity/auth-client',
      '@dfinity/candid',
      '@dfinity/identity',
      '@dfinity/principal',
      '@dfinity/use-auth-client'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: [
      {
        find: 'declarations',
        replacement: fileURLToPath(new URL('../src/declarations', import.meta.url))
      }
    ]
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true
      }
    },
    host: '127.0.0.1'
  }
});
