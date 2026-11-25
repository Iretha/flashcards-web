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
  readonly occurrenceCount: number;
  provenance: { type: 'sourced' | 'mixed' | 'generated'; sources: ProvenanceSource[] };
  answerReferences?: { title: string; url: string }[];
}

/** Target v5 metadata. Kept distinct from CardMetadata while v3/v4 remains live. */
export interface CanonicalCardMetadata {
  cardType: 'question' | 'task';
  readonly occurrenceCount: number;
  provenance?: { type: 'sourced' | 'mixed' | 'generated'; sources: ProvenanceSource[] };
  answerReferences?: { title: string; url: string }[];
}
export interface CanonicalMetadataPatch {
  cardType?: unknown;
  provenance?: unknown;
  answerReferences?: unknown;
}

export function validateMetadata(input: unknown, legacyV3 = false): CardMetadata {
  const data = metadataRecord(input, 'metadata');
  metadataKeys(data, ['cardType', 'topic', 'occurrenceCount', 'provenance', 'answerReferences'], 'metadata');
  if (data.cardType !== 'question' && data.cardType !== 'coding_task') metadataFail('cardType', 'expected question or coding_task');
  metadataText(data.topic, 'topic');
  if (legacyV3 && (!Number.isSafeInteger(data.occurrenceCount) || Number(data.occurrenceCount) < 0)) metadataFail('occurrenceCount', 'expected an integer >= 0');
  if (!legacyV3 && data.occurrenceCount !== undefined) metadataFail('occurrenceCount', 'derived automatically; omit from authored metadata');
  const provenance = validateProvenance(data.provenance, legacyV3)!;
  const occurrenceCount = countOccurrences(provenance.sources);
  if (legacyV3 && data.occurrenceCount !== occurrenceCount) metadataFail('occurrenceCount', 'must equal distinct documented interview occurrenceId values, not source count');
  const answerReferences = data.answerReferences === undefined ? undefined : validateAnswerReferences(data.answerReferences);
  return { cardType: data.cardType, topic: data.topic as string, occurrenceCount, provenance, ...(answerReferences === undefined ? {} : { answerReferences }) };
}

export function validateCanonicalMetadata(input: unknown): CanonicalCardMetadata {
  const data = metadataRecord(input, 'metadata');
  metadataKeys(data, ['cardType', 'provenance', 'answerReferences'], 'metadata');
  if (data.cardType !== 'question' && data.cardType !== 'task') metadataFail('cardType', 'expected question or task');
  const result: Omit<CanonicalCardMetadata, 'occurrenceCount'> = { cardType: data.cardType };
  if (data.provenance !== undefined) result.provenance = validateProvenance(data.provenance, false);
  if (data.answerReferences !== undefined) result.answerReferences = validateAnswerReferences(data.answerReferences);
  return { ...result, occurrenceCount: countOccurrences(result.provenance?.sources ?? []) };
}

/** Presence-aware metadata merge; validates the complete result and never mutates inputs. */
export function applyCanonicalMetadataPatch(existing: CanonicalCardMetadata, input: unknown): CanonicalCardMetadata {
  const patch = metadataRecord(input, 'metadata');
  metadataKeys(patch, ['cardType', 'provenance', 'answerReferences'], 'metadata');
  const next: Record<string, unknown> = {
    cardType: patch.cardType === undefined ? existing.cardType : patch.cardType,
  };
  const provenance = patch.provenance === undefined ? existing.provenance : patch.provenance;
  const references = patch.answerReferences === undefined ? existing.answerReferences : patch.answerReferences;
  if (provenance !== undefined && provenance !== null) next.provenance = structuredClone(provenance);
  if (references !== undefined) next.answerReferences = structuredClone(references);
  return validateCanonicalMetadata(next);
}

function metadataFail(field: string, reason: string): never { throw new Error(field + ': ' + reason); }
function metadataRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return metadataFail(field, 'expected an object');
  return value as Record<string, unknown>;
}
function metadataKeys(value: Record<string, unknown>, allowed: string[], field: string) {
  const unknown = Object.keys(value).find(key => !allowed.includes(key));
  if (unknown) metadataFail(field + '.' + unknown, 'unsupported field');
}
function metadataText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim() || value.length > 2000) return metadataFail(field, 'expected nonempty text (maximum 2000 characters)');
  return value;
}
function metadataUrl(value: unknown, field: string) {
  const result = metadataText(value, field);
  try { const parsed = new URL(result); if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw 0; }
  catch { return metadataFail(field, 'expected an HTTP(S) URL without credentials'); }
  return result;
}
function validateProvenance(input: unknown, legacyV3: boolean) {
  const provenance = metadataRecord(input, 'provenance');
  metadataKeys(provenance, ['type', 'sources'], 'provenance');
  if (provenance.type !== 'sourced' && provenance.type !== 'mixed' && provenance.type !== 'generated') metadataFail('provenance.type', 'expected sourced, mixed or generated');
  const sources = provenance.sources === undefined ? [] : provenance.sources;
  if (!Array.isArray(sources)) metadataFail('provenance.sources', 'expected a list');
  const normalized = sources.map((value, index) => {
    const field = `provenance.sources[${index}]`;
    const source = metadataRecord(value, field);
    metadataKeys(source, ['sourceName', 'sourceUrl', 'company', 'location', 'interviewLocation', 'publishedAt', 'occurrenceId'], field);
    metadataText(source.sourceName, field + '.sourceName'); metadataUrl(source.sourceUrl, field + '.sourceUrl');
    for (const key of ['company', 'location', 'interviewLocation', 'occurrenceId']) if (source[key] !== undefined) metadataText(source[key], field + '.' + key);
    if (source.publishedAt !== undefined) {
      const date = metadataText(source.publishedAt, field + '.publishedAt');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) metadataFail(field + '.publishedAt', 'expected a real YYYY-MM-DD publication date');
    }
    return source as unknown as ProvenanceSource;
  });
  if (provenance.type !== 'generated' && !normalized.length) metadataFail('provenance.sources', 'sourced/mixed requires a verifiable source');
  if (!legacyV3 && provenance.type === 'generated' && countOccurrences(normalized)) metadataFail('provenance', 'generated cards cannot claim interview occurrences');
  return { type: provenance.type, sources: normalized } as CanonicalCardMetadata['provenance'] & {};
}
function validateAnswerReferences(input: unknown) {
  if (!Array.isArray(input)) metadataFail('answerReferences', 'expected a list');
  return input.map((value, index) => {
    const field = `answerReferences[${index}]`;
    const reference = metadataRecord(value, field);
    metadataKeys(reference, ['title', 'url'], field);
    return { title: metadataText(reference.title, field + '.title'), url: metadataUrl(reference.url, field + '.url') };
  });
}

/** Derived metadata retains historical evidence even for contradictory generated records. */
export function derivedMetadata<T extends CardMetadata | CanonicalCardMetadata>(value: T | null): T | null {
  return value && { ...value, occurrenceCount: countOccurrences(value.provenance?.sources ?? []) };
}
export function metadataForStorage<T extends CardMetadata | CanonicalCardMetadata>(value: T | null | undefined) {
  if (!value) return null;
  const { occurrenceCount: _derived, ...authored } = value;
  return authored;
}

export function countOccurrences(sources: ProvenanceSource[]): number {
  return new Set(sources.map(source => source.occurrenceId).filter(id => typeof id === 'string' && id.trim())).size;
}
