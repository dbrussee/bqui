import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    cors: true,
    proxy: {
      '/bqapi/v2.1': {
        target: 'http://192.168.68.202:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/bqapi\/(.*)$/, '/bqapi/$1'),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['access-control-allow-origin'] = '*'
          })
        },
      },
    },
  },
})
