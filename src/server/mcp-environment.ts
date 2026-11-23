export interface McpConfig { APP_ENV?: string; DEPLOYMENT_CLASSIFICATION?: string; PERSONAL_MCP_URLS_ENABLED?: string }
export function mcpEnvironmentAllowed(_buildClassification: unknown, c: McpConfig) {
  return c.PERSONAL_MCP_URLS_ENABLED === 'true';
}
