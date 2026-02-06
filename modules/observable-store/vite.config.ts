import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  esbuild: {
    keepNames: true,
  },
  build: {
    target: 'es2022',
    lib: {
      entry: 'index.ts',
      name: 'ObservableStore',
      formats: ['es', 'cjs'],
      fileName: 'observable-store',
    },
    rollupOptions: {
      external: ['rxjs', 'rxjs/operators'],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
});
