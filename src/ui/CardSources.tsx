import { classificationLabels } from '../lib/classification';
import type { CardMetadata, CanonicalCardMetadata } from '../lib/metadata';
import type { ReactNode } from 'react';

export default function CardSources({ metadata, topics, language, children }: { metadata: CanonicalCardMetadata | CardMetadata; topics?: string[]; language?: string; children?: ReactNode }) {
  const labels = classificationLabels[language === 'bg' ? 'bg' : 'en'];
  const cardType = metadata.cardType === 'coding_task' ? 'task' : metadata.cardType;
  const topicNames = topics ?? ('topic' in metadata ? [metadata.topic] : []);
  return <details className="card-sources">
    <summary>{[labels[cardType], topicNames.join(', ') || labels.noTopics, metadata.provenance?.type, metadata.provenance?.sources.length ? 'Sources' : undefined].filter(Boolean).join(' · ')}</summary>
    {children}
    {metadata.provenance && <p>{metadata.occurrenceCount} documented interview occurrences (not an estimate of interview frequency)</p>}
    {metadata.provenance?.sources.map((source, index) => <div key={index}>
      <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{source.sourceName}</a>
      {source.company && <span> · {source.company}</span>}
      {source.location && <span> · Job location: {source.location}</span>}
      {source.interviewLocation && <span> · Interview location: {source.interviewLocation}</span>}
      {source.publishedAt && <span> · Published: {source.publishedAt}</span>}
      {source.occurrenceId && <span> · Interview evidence: {source.occurrenceId}</span>}
    </div>)}
  </details>;
}
