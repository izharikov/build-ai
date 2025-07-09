import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ['src/storage/index.ts'],
    outDir: 'dist/storage',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
  },
  {
    entry: ['src/components/index.ts'],
    outDir: 'dist/components',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
  },
]);
