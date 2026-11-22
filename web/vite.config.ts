import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Las pruebas cubren dominio e infraestructura (lógica pura): no necesitan DOM.
  test: { environment: 'node' },
})
