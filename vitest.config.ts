import { defineConfig } from 'vitest/config';

export default defineConfig({ define: { 'import.meta.env.MCP_BUILD_CLASSIFICATION': JSON.stringify(process.env.MCP_BUILD_CLASSIFICATION ?? 'development') }, test: { include: ['tests/**/*.test.ts'] } });
