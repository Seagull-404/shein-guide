import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const buildTime = Date.now()

export default defineConfig({
  plugins: [vue()],
  base: '/shein/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/index-${buildTime}.js`,
        chunkFileNames: `assets/[name]-${buildTime}.js`,
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/index-${buildTime}[extname]`
          }
          return `assets/[name]-${buildTime}[extname]`
        },
      },
    },
  },
})
