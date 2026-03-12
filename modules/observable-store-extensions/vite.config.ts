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
      name: 'ObservableStoreExtensions',
      formats: ['es', 'cjs'],
      fileName: 'observable-store-extensions',
    },
    rollupOptions: {
      external: [
        'rxjs',
        'rxjs/operators',
        '@codewithdan/observable-store',
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
});
