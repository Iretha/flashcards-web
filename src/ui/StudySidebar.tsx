import { useEffect, useRef, useState } from 'react';
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

export default function StudySidebar({ language, busy, hasPrevious, historical, answerVisible, onAction, onToggleAnswer }: {
  language: Language;
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
  const sidebar = useRef<HTMLDivElement>(null);
  const dismissed = useRef(false);
  const open = hovered || pinned || focused;
  const labels = studyControlLabels[language];

  useEffect(() => {
    let inside = false;
    let closeTimer: number | undefined;

    function leave() {
      dismissed.current = false;
      if (!inside) return;
      inside = false;
      closeTimer = window.setTimeout(() => {
        setHovered(false);
        setPinned(false);
      }, 250);
    }

    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      // Detect the edge without putting an overlay over the study content.
      if (event.clientX < 40 || (event.target instanceof Node && sidebar.current?.contains(event.target))) {
        window.clearTimeout(closeTimer);
        inside = true;
        if (!dismissed.current) setHovered(true);
      } else {
        leave();
      }
    }

    function pointerOut(event: PointerEvent) {
      if (event.pointerType === 'mouse' && event.relatedTarget === null) leave();
    }

    function outsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !sidebar.current?.contains(event.target)) setPinned(false);
    }

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', pointerOut);
    window.addEventListener('pointerdown', outsidePress);
    return () => {
      window.clearTimeout(closeTimer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', pointerOut);
      window.removeEventListener('pointerdown', outsidePress);
    };
  }, []);

  const actions: { icon: keyof typeof icons; label: string; disabled?: boolean; run: () => void }[] = [
    { icon: 'arrow-left', label: labels.previous, disabled: !hasPrevious, run: () => onAction('previous') },
    { icon: answerVisible ? 'eye-off' : 'eye', label: answerVisible ? labels.hide : labels.show, run: onToggleAnswer },
    { icon: 'check', label: labels.learn, disabled: historical, run: () => onAction('learn') },
    { icon: 'repeat-2', label: labels.repeat, disabled: historical, run: () => onAction('repeat') },
    { icon: 'arrow-right', label: labels.next, run: () => onAction('next') },
  ];

  return <div ref={sidebar} className="study-sidebar" data-pointer-hover={hovered || undefined}>
    <button type="button" className="study-sidebar-tab" aria-label={labels.controls}
      aria-controls="study-sidebar-actions" aria-expanded={open}
      onClick={() => {
        if (pinned || focused) {
          dismissed.current = true;
          setHovered(false);
          setPinned(false);
          setFocused(false);
        } else {
          setPinned(true);
        }
      }}>
      <Icon name="grip" />
      <span className="study-sidebar-tooltip" role="tooltip" aria-hidden="true">{labels.controls}</span>
    </button>
    <div id="study-sidebar-actions" className="study-sidebar-actions" role="group" aria-label={labels.actions}
      hidden={!open} onFocus={event => setFocused(event.target.matches(':focus-visible'))}
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
