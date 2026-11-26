import { useState } from 'react';
import { classificationLabels, sortFields } from '../lib/classification';
import type { ClassificationSort } from '../lib/classification';
import type { Session } from './api';

type Applied = NonNullable<Session['applied']>;
const noTopics = Symbol('No Topics');
const defaultOrder = { field: 'default', direction: 'asc' } as const;
const backKeys = ['Escape', 'Back', 'BrowserBack', 'GoBack'];

function Filter<T>({ label, all, options, values, name, change, search, bg }: {
  label: string; all: string; options: T[]; values: T[]; name: (value: T) => string;
  change: (values: T[]) => void; search?: boolean; bg: boolean;
}) {
  const [query, setQuery] = useState('');
  const unavailable = values.filter(value => !options.includes(value));
  const summary = values.length ? name(values[0]) + (values.length > 1 ? ` + ${values.length - 1} ${bg ? 'избрани' : 'selected'}` : '') : all;
  return <div>
    <span>{label}</span>
    <details className="classification-filter" onKeyDown={event => {
      if (!event.currentTarget.open) return;
      if (backKeys.includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.open = false;
        event.currentTarget.querySelector('summary')?.focus();
      } else if (['ArrowDown', 'ArrowUp'].includes(event.key) && !(event.target instanceof HTMLInputElement && event.target.type === 'search')) {
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('summary, input:not(:disabled), button:not(:disabled)')];
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const next = current + (event.key === 'ArrowDown' ? 1 : -1);
        if (controls[next]) {
          event.preventDefault();
          controls[next].focus();
        }
      }
    }}>
      <summary aria-label={`${label}: ${summary}`}>{summary}</summary>
      <fieldset aria-label={label}>
        {search && <input type="search" aria-label={bg ? 'Търсене на теми' : 'Search topics'} value={query} onChange={event => setQuery(event.target.value)} />}
        {options.filter(value => !search || name(value).toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(value =>
          <label className="check" key={typeof value === 'symbol' ? 'no-topics' : 'value-' + String(value)}>
            <input type="checkbox" checked={values.includes(value)} onChange={event => change(event.target.checked ? [...values, value] : values.filter(item => item !== value))} />{name(value)}
          </label>)}
        {!!unavailable.length && <p>{bg ? 'Недостъпни' : 'Unavailable'}: {unavailable.map(name).join(', ')}</p>}
        <button type="button" disabled={!values.length} onClick={() => change([])}>{bg ? 'Изчисти' : 'Clear'} {label}</button>
      </fieldset>
    </details>
  </div>;
}

export default function StudyClassification({ session, busy, apply, restart }: {
  session: Session & { applied: Applied }; busy: boolean;
  apply: (draft: Applied, applied: () => void) => void; restart: () => void;
}) {
  const [edited, setEdited] = useState<Applied>();
  const draft = (session.status === 'ACTIVE' ? edited : undefined) ?? session.applied;
  const { filters, sorting } = draft;
  const options = session.availableOptions;
  const complete = session.status === 'COMPLETE';
  const bg = session.language === 'bg';
  const labels = classificationLabels[bg ? 'bg' : 'en'];
  const topics = [...filters.topics.values, ...(filters.topics.includeNoTopics ? [noTopics] : [])];
  const topicName = (value: string | symbol) => typeof value === 'symbol' ? labels.noTopics : value;
  const typeName = (value: 'question' | 'task') => labels[value];
  const modeName = (value: 'AI' | 'MANUAL' | 'UNKNOWN') => ({
    AI: bg ? 'Изкуствен интелект' : 'Artificial Intelligence',
    MANUAL: bg ? 'Ръчно' : 'Manual',
    UNKNOWN: bg ? 'Неизвестен' : 'Unknown',
  })[value];
  const names = {
    default: bg ? 'Подредба по подразбиране' : 'Default Order', topics: bg ? 'Теми' : 'Topics',
    priority: bg ? 'Приоритет' : 'Priority', likelihood: bg ? 'Вероятност' : 'Likelihood',
    creationMode: labels.creationMode, cardType: labels.cardType,
  };
  const directionName = (direction: ClassificationSort['direction']) => direction === 'asc' ? (bg ? 'Възходящо' : 'Ascending') : (bg ? 'Низходящо' : 'Descending');
  const change = (patch: Partial<Applied['filters']>) => setEdited({ ...draft, filters: { ...filters, ...patch } });
  const allTopics = bg ? 'Всички теми' : 'All topics';
  const allPriorities = bg ? 'Всички приоритети' : 'All priorities';
  const allLikelihoods = bg ? 'Всички вероятности' : 'All likelihoods';
  const allModes = bg ? 'Всички начини на създаване' : 'All Creation Modes';
  const rows = [
    [names.topics, topics.map(topicName).join(', ') || allTopics],
    [names.priority, filters.priorities.map(value => labels.priority[value]).join(', ') || allPriorities],
    [names.likelihood, filters.likelihoods.map(value => labels.likelihood[value]).join(', ') || allLikelihoods],
    [names.creationMode, filters.creationModes.map(modeName).join(', ') || allModes],
    [names.cardType, filters.cardTypes.map(typeName).join(', ') || labels.allCardTypes],
  ];
  return <div className="study-classification" onKeyDown={event => {
    if (backKeys.includes(event.key) && event.currentTarget.querySelector('details[open]')) {
      event.preventDefault();
      event.stopPropagation();
      const panel = event.currentTarget.querySelector('details');
      if (panel) {
        panel.open = false;
        panel.querySelector('summary')?.focus();
      }
    }
  }}>
    <details>
      <summary>{bg ? 'Филтри и подредба' : 'Filters and sorting'}</summary>
      {complete ? <dl>
        {rows.map(([label, selected]) => <div key={label}><dt>{label}</dt><dd>{selected}</dd></div>)}
        <div><dt>{bg ? 'Подредба' : 'Sort by'}</dt><dd>{names[sorting.field]} · {directionName(sorting.direction)}</dd></div>
      </dl> : <fieldset className="stack classification-settings" disabled={busy}>
        <div className="classification-grid">
          <Filter label={names.topics} all={allTopics} options={[...options.topics, ...(options.noTopicsAvailable ? [noTopics] : [])]} values={topics} name={topicName} search bg={bg}
              change={values => change({ topics: { values: values.filter((value): value is string => typeof value === 'string'), includeNoTopics: values.includes(noTopics) } })} />
          <Filter label={names.priority} all={allPriorities} options={options.priorities} values={filters.priorities} name={value => labels.priority[value]} bg={bg} change={priorities => change({ priorities })} />
          <Filter label={names.likelihood} all={allLikelihoods} options={options.likelihoods} values={filters.likelihoods} name={value => labels.likelihood[value]} bg={bg} change={likelihoods => change({ likelihoods })} />
          <Filter label={names.creationMode} all={allModes} options={options.creationModes} values={filters.creationModes} name={modeName} bg={bg} change={creationModes => change({ creationModes })} />
          <Filter label={names.cardType} all={labels.allCardTypes} options={options.cardTypes} values={filters.cardTypes} name={typeName} bg={bg} change={cardTypes => change({ cardTypes })} />
        </div>
        <div className="row">
          <button onClick={() => change({ topics: { values: [], includeNoTopics: false }, priorities: [], likelihoods: [], creationModes: [], cardTypes: [] })}>{bg ? 'Изчисти всички' : 'Clear All'}</button>
          <button disabled={!edited} onClick={() => setEdited(undefined)}>{bg ? 'Отмени промените' : 'Cancel changes'}</button>
        </div>
        <div className="row">
          <label>{bg ? 'Подреди по' : 'Sort by'}<select value={sorting.field} onChange={event => setEdited({ ...draft, sorting: { field: event.target.value as ClassificationSort['field'], direction: event.target.value === 'default' ? 'asc' : sorting.direction } })}>
            {sortFields.map(field => <option key={field} value={field}>{names[field]}</option>)}
          </select></label>
          <label>{bg ? 'Посока' : 'Direction'}<select value={sorting.direction} disabled={sorting.field === 'default'} onChange={event => setEdited({ ...draft, sorting: { ...sorting, direction: event.target.value as ClassificationSort['direction'] } })}>
            <option value="asc">{directionName('asc')}</option><option value="desc">{directionName('desc')}</option>
          </select></label>
          <button onClick={() => setEdited({ ...draft, sorting: defaultOrder })}>{bg ? 'Възстанови подредбата' : 'Restore Default Order'}</button>
          <button className="primary" disabled={!edited} onClick={() => apply(draft, () => setEdited(undefined))}>{bg ? 'Приложи' : 'Apply'}</button>
        </div>
      </fieldset>}
    </details>
    <div className="row">
      <span role="status">{bg ? `Приложено: ${session.eligibleTotal} от ${session.scopeTotal} карти` : `Applied: ${session.eligibleTotal} of ${session.scopeTotal} cards`}</span>
      {complete && <button className="primary" disabled={busy} onClick={restart}>{bg ? 'Започни отначало' : 'Restart Session'}</button>}
    </div>
  </div>;
}
