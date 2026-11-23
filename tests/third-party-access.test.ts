import { describe, expect, it } from 'vitest';
import { thirdPartyPermissions } from '../src/server/third-party-access';
describe('third-party permission intersection', () => {
  for (const membership of ['owner', 'collaborator', null] as const) {
    for (const access of ['NONE', 'READ', 'READ_WRITE'] as const) {
      for (const read of [false, true]) for (const write of [false, true]) {
        it(`${membership}/${access}/credential ${read}/${write}`, () => {
          const result = thirdPartyPermissions(membership, access, { read, write });
          expect(result.read).toBe(membership !== null && read && access !== 'NONE');
          expect(result.write).toBe(membership !== null && read && write && access === 'READ_WRITE');
        });
      }
    }
  }
});
