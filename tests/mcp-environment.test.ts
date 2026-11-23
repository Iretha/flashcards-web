import { expect, it } from 'vitest';
import { mcpEnvironmentAllowed } from '../src/server/mcp-environment';
const classifications = [undefined, '', 'unknown', 'production', 'preprod', 'development'];
for (const build of classifications) for (const runtime of classifications) for (const app of classifications) {
  it(`fails closed for build=${build}, deployment=${runtime}, app=${app}`, () => {
    const expected = (build === 'preprod' || build === 'development') && runtime === build && app === build;
    expect(mcpEnvironmentAllowed(build, { DEPLOYMENT_CLASSIFICATION: runtime, APP_ENV: app, PERSONAL_MCP_URLS_ENABLED: 'true' })).toBe(expected);
  });
}
it.each([undefined, 'false', 'TRUE', ''])('requires explicit feature flag %s', flag => {
  expect(mcpEnvironmentAllowed('preprod', { DEPLOYMENT_CLASSIFICATION: 'preprod', APP_ENV: 'preprod', PERSONAL_MCP_URLS_ENABLED: flag })).toBe(false);
});
