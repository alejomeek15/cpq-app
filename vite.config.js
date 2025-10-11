import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuración para obtener la ruta del directorio en Módulos ES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Esta es la forma correcta y robusta de definir el alias
      '@': path.resolve(__dirname, './src'),
    },
  },
});