import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  oxc: false,
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2024',
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
      sourceMaps: true,
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    globals: true,
    coverage: {
      reporter: ['clover', 'json', 'lcov', 'text'],
      include: ['src/**/*.ts'],
    },
    disableConsoleIntercept: true,
    clearMocks: true,
    setupFiles: ['reflect-metadata'],
    fileParallelism: false,
    testTimeout: 60_000,
  },
});
