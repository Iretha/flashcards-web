import { useState } from 'react';
import type { StudyAction } from '../lib/study';

const icons = {
  'arrow-left': 'M19 12H5m7-7-7 7 7 7',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z',
  'eye-off': 'M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.4 3.3M6.3 6.3A18 18 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 5.7-1.7',
  check: 'm5 12 4 4L19 6',
  'repeat-2': 'm16 3 4 4-4 4M4 11V9a2 2 0 0 1 2-2h14M8 21l-4-4 4-4m12 0v2a2 2 0 0 1-2 2H4',
  'arrow-right': 'M5 12h14m-7-7 7 7-7 7',
  grip: 'M9 6v12m6-12v12',
};

const controlsLabel = 'Study controls';

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={icons[name]} />
  </svg>;
}

export default function StudySidebar({ busy, hasPrevious, historical, answerVisible, onAction, onToggleAnswer }: {
  busy: boolean;
  hasPrevious: boolean;
  historical: boolean;
  answerVisible: boolean;
  onAction: (action: StudyAction) => void;
  onToggleAnswer: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = hovered || pinned || focused;
  const actions: { icon: keyof typeof icons; label: string; disabled?: boolean; run: () => void }[] = [
    { icon: 'arrow-left', label: 'Previous', disabled: !hasPrevious, run: () => onAction('previous') },
    { icon: answerVisible ? 'eye-off' : 'eye', label: answerVisible ? 'Hide answer' : 'Show answer', run: onToggleAnswer },
    { icon: 'check', label: 'Learned', disabled: historical, run: () => onAction('learn') },
    { icon: 'repeat-2', label: 'Repeat', disabled: historical, run: () => onAction('repeat') },
    { icon: 'arrow-right', label: 'Next', run: () => onAction('next') },
  ];

  return <div className="study-sidebar" data-pointer-hover={hovered || undefined}
    onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
    onPointerLeave={() => setHovered(false)}>
    <button type="button" className="study-sidebar-tab" aria-label={controlsLabel}
      aria-controls="study-sidebar-actions" aria-expanded={open}
      onClick={event => {
        setPinned(!pinned);
        if (pinned) {
          event.currentTarget.focus();
          setHovered(false);
          setFocused(false);
        }
      }}>
      <Icon name="grip" />
      <span className="study-sidebar-tooltip" role="tooltip" aria-hidden="true">{controlsLabel}</span>
    </button>
    <div id="study-sidebar-actions" className="study-sidebar-actions" role="group" aria-label="Study actions"
      hidden={!open} onFocus={() => setFocused(true)}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      {actions.map(({ icon, label, disabled, run }) => <button key={icon === 'eye-off' ? 'eye' : icon} type="button"
        className="study-sidebar-action" aria-label={label} aria-disabled={busy || Boolean(disabled)}
        onClick={() => { if (!busy && !disabled) run(); }}>
        <Icon name={icon} />
        <span className="study-sidebar-tooltip" role="tooltip" aria-hidden="true">{label}</span>
      </button>)}
    </div>
  </div>;
}
