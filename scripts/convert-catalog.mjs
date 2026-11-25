import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const conversionVersion = 'IMP-005/1';
export const oldRubric = '5 = typical/core interview question; 4 = highly relevant and likely; 3 = plausible but less common; 2 = uncommon or stack/project-specific; 1 = very unlikely outside academic, DBA or specialist interviews.';
export const targetRubric = '1 = Very High (typical/core interview question); 2 = High (highly relevant and likely); 3 = Medium (plausible but less common); 4 = Low (uncommon or stack/project-specific); 5 = Very Low (very unlikely outside academic, DBA or specialist interviews).';
export const marker = '<!-- likelihood-scale: v5-1-highest; conversion: IMP-005/1 -->';
export const hash = source => createHash('sha256').update(source).digest('hex');

/** Explicit per-file attestation, never numeric scale detection. No catalog-to-deck conversion. */
export function convertCatalog(source, filename, manifest) {
  if (source.includes('likelihood-scale: v5-1-highest')) throw new Error(`${filename}: already target scale; refusing a second inversion.`);
  const entry = manifest.files[filename];
  if (manifest.conversionVersion !== conversionVersion || manifest.rubric !== oldRubric || !entry || entry.sourceSha256 !== hash(source)) throw new Error(`${filename}: reviewed old-scale manifest/hash/version mismatch; review this exact source first.`);
  if (!source.includes(oldRubric) || source.split(oldRubric).length !== 2) throw new Error(`${filename}: expected the attested old legend exactly once.`);
  const rawValues = [];
  let distribution = false;
  let questions = false;
  const lines = source.split('\n').map(line => {
    if (line.startsWith('## ')) distribution = line === '## Likelihood distribution';
    if (line === '| ID | Question | Origin | Topics | Priority | Evidence | Likelihood |') questions = true;
    else if (!line.startsWith('|')) questions = false;
    const row = /^(\| (\d+) \| .+ \| )([1-5])( \|)$/.exec(line);
    if (questions && row) {
      if (Number(row[2]) !== rawValues.length + 1) throw new Error(`${filename}: nonconsecutive local ID ${row[2]}; review without renumbering.`);
      rawValues.push(Number(row[3]));
      return `${row[1]}${6 - Number(row[3])}${row[4]}`;
    }
    if (/^\| \d+ \|/.test(line) && questions) throw new Error(`${filename}: unrepresentable question row: ${line}`);
    if (distribution) return line.replace(/^\| ([1-5]) \|/, (_, value) => `| ${6 - Number(value)} |`);
    return line;
  });
  if (!rawValues.length) throw new Error(`${filename}: no question rows.`);
  const markdown = lines.join('\n').replace(oldRubric, targetRubric).replace('## Interview likelihood\n', `## Interview likelihood\n\n${marker}\n\nHistorical rating ranges in evidence notes below retain the old 5-highest rubric; current table values use the target scale. Editorial origin is retained; app creationMode remains UNKNOWN without reliable attestation. This catalog requires separately approved answers/task specifications before deck preparation.\n`);
  return { markdown, report: { filename, conversionVersion, sourceSha256: hash(source), targetSha256: hash(markdown), sourceRubric: oldRubric, targetRubric, count: rawValues.length, rawValuesByLocalId: rawValues, note: 'Array index + 1 is local question ID. Every target value = 6 - raw. Questions, topics, priorities, origins and evidence are unchanged. No answer/task content generated.' } };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [filename, output] = process.argv.slice(2);
  if (!filename || !output || resolve(filename) === resolve(output)) throw new Error('Usage: node scripts/convert-catalog.mjs <reviewed-source-path> <separate-output-path>');
  const manifest = JSON.parse(await readFile(new URL('../docs/card-classification/conversion/catalog-manifest.json', import.meta.url), 'utf8'));
  const result = convertCatalog(await readFile(filename, 'utf8'), filename.replaceAll('\\', '/').split('/').at(-1), manifest);
  await writeFile(output, result.markdown, { flag: 'wx' });
  process.stdout.write(JSON.stringify(result.report, null, 2) + '\n');
}
