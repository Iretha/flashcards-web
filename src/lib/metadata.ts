export interface ProvenanceSource {
  sourceName: string;
  sourceUrl: string;
  company?: string;
  location?: string;
  interviewLocation?: string;
  publishedAt?: string;
  /** Same identifier for reposts or accounts of the same interview. */
  occurrenceId?: string;
}
export interface CardMetadata {
  cardType: 'question' | 'coding_task';
  topic: string;
  occurrenceCount: number;
  provenance: { type: 'sourced' | 'mixed' | 'generated'; sources: ProvenanceSource[] };
  answerReferences?: { title: string; url: string }[];
}

export function validateMetadata(input: unknown): CardMetadata {
  const fail = (field: string, reason: string): never => { throw new Error(field + ': ' + reason); };
  const record = (value: unknown, field: string): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return fail(field, 'expected an object');
    return value as Record<string, unknown>;
  };
  const text = (value: unknown, field: string) => {
    if (typeof value !== 'string' || !value.trim() || value.length > 2000) return fail(field, 'expected nonempty text (maximum 2000 characters)');
    return value;
  };
  const url = (value: unknown, field: string) => {
    const result = text(value, field);
    try { const parsed = new URL(result); if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw 0; }
    catch { return fail(field, 'expected an HTTP(S) URL without credentials'); }
    return result;
  };
  const data = record(input, 'metadata');
  const keys = (value: Record<string, unknown>, allowed: string[], field: string) => {
    const unknown = Object.keys(value).find(key => !allowed.includes(key));
    if (unknown) fail(field + '.' + unknown, 'unsupported field');
  };
  keys(data, ['cardType', 'topic', 'occurrenceCount', 'provenance', 'answerReferences'], 'metadata');
  if (data.cardType !== 'question' && data.cardType !== 'coding_task') fail('cardType', 'expected question or coding_task');
  text(data.topic, 'topic');
  if (!Number.isSafeInteger(data.occurrenceCount) || Number(data.occurrenceCount) < 0) fail('occurrenceCount', 'expected an integer >= 0');
  const provenance = record(data.provenance, 'provenance');
  keys(provenance, ['type', 'sources'], 'provenance');
  if (provenance.type !== 'sourced' && provenance.type !== 'mixed' && provenance.type !== 'generated') fail('provenance.type', 'expected sourced, mixed or generated');
  const sources = provenance.sources === undefined ? [] : provenance.sources;
  if (!Array.isArray(sources)) fail('provenance.sources', 'expected a list');
  const evidence = new Set<string>();
  const normalized = (sources as unknown[]).map((value, index) => {
    const field = `provenance.sources[${index}]`;
    const source = record(value, field);
    keys(source, ['sourceName', 'sourceUrl', 'company', 'location', 'interviewLocation', 'publishedAt', 'occurrenceId'], field);
    text(source.sourceName, field + '.sourceName'); url(source.sourceUrl, field + '.sourceUrl');
    for (const key of ['company', 'location', 'interviewLocation', 'occurrenceId']) if (source[key] !== undefined) text(source[key], field + '.' + key);
    if (source.occurrenceId) evidence.add(String(source.occurrenceId));
    if (source.publishedAt !== undefined) {
      const date = text(source.publishedAt, field + '.publishedAt');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) fail(field + '.publishedAt', 'expected a real YYYY-MM-DD publication date');
    }
    return source as unknown as ProvenanceSource;
  });
  if (provenance.type !== 'generated' && !normalized.length) fail('provenance.sources', 'sourced/mixed requires a verifiable source');
  if (data.occurrenceCount !== evidence.size) fail('occurrenceCount', 'must equal distinct documented interview occurrenceId values, not source count');
  if (data.answerReferences !== undefined) {
    if (!Array.isArray(data.answerReferences)) fail('answerReferences', 'expected a list');
    (data.answerReferences as unknown[]).forEach((value, index) => {
      const ref = record(value, `answerReferences[${index}]`);
      keys(ref, ['title', 'url'], `answerReferences[${index}]`);
      text(ref.title, `answerReferences[${index}].title`); url(ref.url, `answerReferences[${index}].url`);
    });
  }
  return { ...data, provenance: { ...provenance, sources: normalized } } as unknown as CardMetadata;
}
