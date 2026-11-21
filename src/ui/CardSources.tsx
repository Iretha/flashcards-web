import type { CardMetadata } from '../lib/metadata';
import type { ReactNode } from 'react';

export default function CardSources({ metadata, children }: { metadata: CardMetadata; children?: ReactNode }) {
  return <details className="card-sources">
    <summary>{metadata.cardType === 'coding_task' ? 'Coding Task' : 'Question'} · {metadata.topic} · {metadata.provenance.type} · Sources</summary>
    {children}
    <p>{metadata.occurrenceCount} documented interview occurrences (not an estimate of interview frequency)</p>
    {metadata.provenance.sources.map((source, index) => <div key={index}>
      <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{source.sourceName}</a>
      {source.company && <span> · {source.company}</span>}
      {source.location && <span> · Job location: {source.location}</span>}
      {source.interviewLocation && <span> · Interview location: {source.interviewLocation}</span>}
      {source.publishedAt && <span> · Published: {source.publishedAt}</span>}
      {source.occurrenceId && <span> · Interview evidence: {source.occurrenceId}</span>}
    </div>)}
  </details>;
}
