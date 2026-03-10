import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/shein/',
  build: {
    rollupOptions: {
      output: {
        // 禁用文件名哈希，使用固定名称
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css)$/i.test(assetInfo.name)) {
            return 'assets/[name][extname]'
          }
          return 'assets/[name][extname]'
        },
      },
    },
  },
})
