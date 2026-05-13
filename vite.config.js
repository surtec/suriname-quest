import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Phaser heeft dit nodig
  define: {
    'typeof CANVAS_RENDERER': '"true"',
    'typeof WEBGL_RENDERER': '"true"',
  },
})
