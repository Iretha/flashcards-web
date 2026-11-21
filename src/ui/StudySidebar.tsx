
import type { StudyAction } from '../lib/study';
import { studyControlLabels } from '../lib/translations';
import type { Language } from '../lib/translations';

const icons = {
  'arrow-left': 'M19 12H5m7-7-7 7 7 7',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
  'eye-off': 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.4 3.3M6.3 6.3A18 18 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 5.7-1.7',
  check: 'm5 12 4 4L19 6',
  'repeat-2': 'm16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4',
  'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
  grip: 'M9 6v12m6-12v12',
};

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={icons[name]} />
  </svg>;
}

export default function StudySidebar({ language, busy, hasPrevious, repeat = false, answerVisible, onAction, onToggleAnswer }: {
  language: Language;
  busy: boolean;
  hasPrevious: boolean;
  historical: boolean;
  repeat?: boolean;
  answerVisible: boolean;
  onAction: (action: StudyAction) => void;
  onToggleAnswer: () => void;
}) {
  const labels = studyControlLabels[language];

  const actions: { icon: keyof typeof icons; label: string; disabled?: boolean; run: () => void }[] = [
    { icon: 'arrow-left', label: labels.previous, disabled: !hasPrevious, run: () => onAction('previous') },
    { icon: answerVisible ? 'eye-off' : 'eye', label: answerVisible ? labels.hide : labels.show, run: onToggleAnswer },
    { icon: 'arrow-right', label: labels.next, run: () => onAction('next') },
  ];

  return <div className="study-sidebar">
    <div id="study-sidebar-actions" className="study-sidebar-actions" role="group" aria-label={labels.actions}>
      <button type="button" className="study-sidebar-action" aria-label={labels.repeat}
        aria-pressed={repeat} aria-disabled={busy} onClick={() => { if (!busy) onAction('repeat'); }}>
        <Icon name="repeat-2" />
        <span className="study-sidebar-tooltip" role="tooltip" aria-hidden="true">{labels.repeat}</span>
      </button>      {actions.map(({ icon, label, disabled, run }) => <button key={icon === 'eye-off' ? 'eye' : icon} type="button"
        className="study-sidebar-action" aria-label={label} aria-disabled={busy || Boolean(disabled)}
        onClick={() => { if (!busy && !disabled) run(); }}>
        <Icon name={icon} />
        <span className="study-sidebar-tooltip" role="tooltip" aria-hidden="true">{label}</span>
      </button>)}
    </div>
  </div>;
}
