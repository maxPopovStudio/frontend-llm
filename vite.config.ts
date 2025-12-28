import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Додаємо headers для підтримки SharedArrayBuffer та WebAssembly
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Збільшуємо ліміт для великих файлів transformers.js
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    // Виключаємо transformers.js з оптимізації, щоб уникнути проблем з ONNX Runtime
    exclude: ['@xenova/transformers']
  },
  // Дозволяємо transformers.js працювати з WebAssembly та іншими ресурсами
  assetsInclude: ['**/*.wasm'],
  // Налаштування для правильної роботи з ONNX Runtime
  worker: {
    format: 'es'
  },
  // Додаємо налаштування для правильного завантаження ONNX Runtime
  resolve: {
    conditions: ['import', 'module', 'browser', 'default'],
    alias: {
      // Примусово використовуємо UMD версію, щоб уникнути помилки registerBackend
      'onnxruntime-web': 'onnxruntime-web/dist/ort.min.js'
    }
  }
})

