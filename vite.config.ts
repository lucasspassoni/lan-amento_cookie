import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Evita falhas de `fs.watch` em arquivos de mídia bloqueados no Windows.
      usePolling: true,
      interval: 300,
    },
  },
})
