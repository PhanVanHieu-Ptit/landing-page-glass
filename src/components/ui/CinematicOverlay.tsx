import { useLayoutEffect, useState, type RefObject, type CSSProperties } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './CinematicOverlay.css';

export type CinematicOverlayProps = {
  /** Normalized progress supplied by the scene owner. No scroll listeners are installed. */
  progress: number;
  scrollRoot?: RefObject<HTMLElement | null>;
};

// Copy follows the existing scene boundaries; this component owns only its typography.
const cues = [
  { start: 0, end: 0.2, label: '01 / THE ASCENT', lines: ['BEYOND THE', 'ELEMENTS'], detail: 'A new perspective on performance.' },
  { start: 0.2, end: 0.36, label: '02 / FIND YOUR FOCUS', lines: ['ENGINEERED', 'FOR CLARITY'], detail: 'Focus on what lies ahead.' },
  { start: 0.36, end: 0.48, label: '03 / NOTHING ELSE', lines: ['AERIS X1'], detail: 'Nothing between you and the mountain.' },
  { start: 0.48, end: 0.66, label: '04 / CLOSER TO CLARITY', lines: ['ENGINEERED', 'FOR CLARITY'], detail: 'A closer look. A clearer perspective.' },
  { start: 0.66, end: 0.86, label: '05 / EVERY ANGLE', lines: ['PRECISION IN', 'EVERY DESCENT'], detail: 'Performance from every perspective.' },
  { start: 0.86, end: 1, label: '06 / MAKE IT YOURS', lines: ['AERIS X1'], detail: 'Your next perspective starts here.' },
] as const;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

/** Mount inside a positioned scene container. Leaves pointer and keyboard input to the scene. */
export function CinematicOverlay({ progress, scrollRoot }: CinematicOverlayProps) {
  const [scrollProgress, setScrollProgress] = useState(progress);
  useLayoutEffect(() => {
    const host = scrollRoot?.current;
    if (!host) return;
    const update = () => setScrollProgress(Number(host.style.getPropertyValue('--progress')) || 0);
    update();
    host.addEventListener('cinematicframe', update);
    return () => host.removeEventListener('cinematicframe', update);
  }, [scrollRoot]);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const value = scrollRoot ? scrollProgress : progress;
  const p = clamp(Number.isFinite(value) ? value : 0);
  const index = cues.findIndex((cue, i) => p < cue.end || i === cues.length - 1);
  const cue = cues[index];
  const local = (p - cue.start) / (cue.end - cue.start);
  // The opening frame is readable. Subsequent cues reveal as a single composed block.
  const entrance = index === 0 ? 1 : ease(clamp(local / 0.16));
  const exit = index === cues.length - 1 ? 1 : ease(clamp((1 - local) / 0.14));
  const reveal = reducedMotion ? 1 : Math.min(entrance, exit);
  const style = {
    '--co-reveal': reveal,
    '--co-inset': `${(1 - reveal) * 100}%`,
    '--co-offset': `${(1 - reveal) * 0.65}em`,
    '--co-tracking': `${-0.045 + (1 - reveal) * 0.018}em`,
  } as CSSProperties;

  return (
    <div className="cinematic-overlay" style={style} data-cue={index + 1}>
      <div className="cinematic-overlay__identity" aria-hidden="true">
        <span className="cinematic-overlay__marker" />
        <span>AERIS X1</span>
        <span className="cinematic-overlay__category">ALPINE OPTICS</span>
      </div>
      <section className="cinematic-overlay__copy" aria-label={cue.lines.join(' ')}>
        <p className="cinematic-overlay__eyebrow">{cue.label}</p>
        <h2 className="cinematic-overlay__headline">
          {cue.lines.map(line => (
            <span className="cinematic-overlay__mask" key={line}>
              <span className="cinematic-overlay__line">{line}</span>
            </span>
          ))}
        </h2>
        <p className="cinematic-overlay__description">{cue.detail}</p>
      </section>
      <div className="cinematic-overlay__footer" aria-hidden="true">
        <span>DESIGNED FOR THE ELEMENTS</span>
        <span className="cinematic-overlay__scroll">{index === cues.length - 1 ? 'THE NEXT PERSPECTIVE' : 'SCROLL TO DISCOVER'}<span>↓</span></span>
        <span className="cinematic-overlay__count">0{index + 1}<span> / 06</span></span>
      </div>
    </div>
  );
}

export default CinematicOverlay;
