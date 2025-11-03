import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js', 'src/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/models/**/*.js'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/main.jsx',
        'src/App.jsx',
        '**/*.config.js'
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85
      }
    }
  }
});