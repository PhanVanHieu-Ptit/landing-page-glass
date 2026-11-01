import { forwardRef } from 'react';
/** Persistent stage: future film/canvas layers mount here, never in chapter sections. */
export const NarrativeStage = forwardRef<HTMLDivElement>(function NarrativeStage(_, ref) {
  return <div className="stage-content" ref={ref}>
    <div className="stage-grid" aria-hidden="true" />
    <div className="stage-coordinate" aria-hidden="true">46°35′ N / 10°49′ E <span>ALT. 3,240 M</span></div>
    <div className="stage-center">
      <p className="eyebrow">AERIS / ALPINE OPTICS</p>
      <h1>Above the<br/><em>ordinary.</em></h1>
      <p className="stage-description">A new perspective on performance.</p>
      <div className="placeholder-note"><span /> CINEMATIC PLACEHOLDER · PRODUCTION MEDIA PENDING</div>
    </div>
    <div className="stage-bottom"><span>ENGINEERED FOR THE ELEMENTS</span><span>AERIS X1 / 001</span></div>
  </div>;
});
