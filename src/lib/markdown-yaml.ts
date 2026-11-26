import { parseDocument, visit } from 'yaml';

/** Untrusted authored YAML: core values only, with no aliases or custom tags. */
export function parseMarkdownYaml(source: string): unknown {
  const document = parseDocument(source, { schema: 'core', uniqueKeys: true });
  if (document.errors.length || document.warnings.length) throw document.errors[0] ?? document.warnings[0];
  visit(document, { Alias() { throw new Error('YAML aliases are not supported.'); } });
  return document.toJS({ maxAliasCount: 0 });
}
