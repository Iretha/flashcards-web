import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { convertCatalog, hash, marker, oldRubric, targetRubric } from '../scripts/convert-catalog.mjs';
const manifest = JSON.parse(readFileSync('docs/card-classification/conversion/catalog-manifest.json', 'utf8'));
const reports = JSON.parse(readFileSync('docs/card-classification/conversion/catalog-report.json', 'utf8'));

for (const report of reports) {
 it(`converts ${report.filename} reproducibly with unchanged questions, local IDs and evidence`, () => {
   const target = readFileSync('docs/samples/db/' + report.filename, 'utf8');
   expect(hash(target)).toBe(report.targetSha256);
   // Reconstruct the exact attested original, including all non-rating bytes.
   let source = target.replace(targetRubric, oldRubric).replace(`\n${marker}\n\nHistorical rating ranges in evidence notes below retain the old 5-highest rubric; current table values use the target scale. Editorial origin is retained; app creationMode remains UNKNOWN without reliable attestation. This catalog requires separately approved answers/task specifications before deck preparation.\n`, '');
   let questions = false, distribution = false, count = 0;
   source = source.split('\n').map(line => {
     if (line.startsWith('## ')) distribution = line === '## Likelihood distribution';
     if (line === '| ID | Question | Origin | Topics | Priority | Evidence | Likelihood |') questions = true;
     else if (!line.startsWith('|')) questions = false;
     if (questions && /^\| \d+ \|/.test(line)) {
       count++;
       expect(Number(/^\| (\d+)/.exec(line)![1])).toBe(count);
       const raw = report.rawValuesByLocalId[count - 1];
       expect(Number(/([1-5]) \|$/.exec(line)![1])).toBe(6 - raw);
       return line.replace(/[1-5] \|$/, raw + ' |');
     }
     return distribution ? line.replace(/^\| ([1-5]) \|/, (_, value) => `| ${6 - Number(value)} |`) : line;
   }).join('\n');
   expect(count).toBe(report.count);
   if (target.includes('## Likelihood distribution')) {
     const distribution = target.split('## Likelihood distribution')[1].split(/\n## /)[0];
     for (const row of distribution.matchAll(/^\| ([1-5]) \| (\d+) \|$/gm)) {
       expect(Number(row[2])).toBe(report.rawValuesByLocalId.filter((raw: number) => 6 - raw === Number(row[1])).length);
     }
   }
   expect(hash(source)).toBe(report.sourceSha256);
   expect(hash(source)).toBe(manifest.files[report.filename].sourceSha256);
   const result = convertCatalog(source, report.filename, manifest);
   expect(result.markdown).toBe(target);
   expect(result.report).toEqual(report);
   expect(convertCatalog(source, report.filename, manifest)).toEqual(result);
   expect(() => convertCatalog(target, report.filename, manifest)).toThrow('already target');
   expect(() => convertCatalog(source + '\n', report.filename, manifest)).toThrow('hash/version mismatch');
   expect(() => convertCatalog(source, report.filename, { ...manifest, conversionVersion: 'other' })).toThrow('hash/version mismatch');
   expect(() => convertCatalog(source, 'unreviewed.md', manifest)).toThrow('hash/version mismatch');
 });
}
