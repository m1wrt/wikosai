import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wikosai/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        mei: 'mei.html',
        wikos: 'chat.html',
      },
    },
  },
})