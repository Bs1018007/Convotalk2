import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: mode === 'development',
      rollupOptions: {
        output: { manualChunks: undefined },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,

      // ✅ Add this block
      allowedHosts: [
        'convotalk2-1.onrender.com', // <-- Your deployed frontend URL
        'localhost',
        '127.0.0.1',
      ],

      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
        '/auth': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    preview: {
      port: 5173,
      strictPort: true,

      // ✅ Also allow the deployed domain during preview
      allowedHosts: ['convotalk2-1.onrender.com'],
    },
  }
})
