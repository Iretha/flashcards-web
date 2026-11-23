export interface McpConfig { APP_ENV?: string; DEPLOYMENT_CLASSIFICATION?: string; PERSONAL_MCP_URLS_ENABLED?: string }
export function mcpEnvironmentAllowed(buildClassification: unknown, c: McpConfig) {
  return (buildClassification === 'preprod' || buildClassification === 'development')
    && c.DEPLOYMENT_CLASSIFICATION === buildClassification
    && c.APP_ENV === buildClassification
    && c.PERSONAL_MCP_URLS_ENABLED === 'true';
}
