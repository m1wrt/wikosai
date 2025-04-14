import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// OK
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wikosai/', // Asegúrate de que coincida con el nombre del repositorio
  build: {
    rollupOptions: {
      input: {
        main: '/index.html', // Página principal
        mei: '/mei.html',    // Página Mei
        wikos: '/chat.html', // Página Chat
      },
    },
  },
})
