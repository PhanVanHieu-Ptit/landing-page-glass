import { useMemo, useRef } from 'react';
import { SCENE_RANGES } from '../animations/timeline';
import { NarrativeStage } from '../components/cinematic/NarrativeStage';
import { ProductFallback } from '../components/product/ProductFallback';
import { CommercePlaceholder } from '../components/commerce/CommercePlaceholder';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useScrollNarrative } from '../hooks/useScrollNarrative';
import type { SceneController, SceneFrame, SceneId } from '../lib/contracts';
export function ProductPage() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 767px)');
  const controllers = useMemo(() => new Map<SceneId, SceneController>(SCENE_RANGES.map(range => [range.id, {
    update: (frame: SceneFrame) => {
      const chapter = root.current?.querySelector<HTMLElement>(`[data-scene="${range.id}"]`);
      chapter?.toggleAttribute('data-active', frame.active);
      if (frame.active && stage.current) {
        stage.current.dataset.scene = range.id;
        stage.current.querySelector('h1')!.textContent = range.id === 'alpine' ? 'Above the ordinary.' : range.label;
        stage.current.querySelector('.stage-description')!.textContent = range.id === 'alpine' ? 'A new perspective on performance.' : range.description;
      }
    }, dispose: () => {},
  }])), []);
  useScrollNarrative(root, controllers, reduced ? 'reduced' : 'full', mobile ? 'mobile' : 'desktop');
  return <>
    <a className="skip-link" href="#chapters">Skip to narrative outline</a>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="AERIS home">AERIS<span>®</span></a><span className="header-caption">SEE BEYOND.</span><a className="header-link" href="#commerce">Explore X1 <span aria-hidden="true">↗</span></a></header>
    <main ref={root} id="top" className="narrative">
      <div className="stage" aria-hidden="true"><NarrativeStage ref={stage}/></div>
      <div id="chapters" className="chapters" tabIndex={-1}>
        {SCENE_RANGES.map((range, index) => <section key={range.id} id={range.id} data-scene={range.id} className="chapter" style={{ flexGrow: range.end - range.start }} aria-labelledby={`${range.id}-title`}>
          <div className="chapter-card"><span className="chapter-index">0{index + 1} / 06</span><div><p className="eyebrow">NARRATIVE / {range.id.toUpperCase()}</p><h2 id={`${range.id}-title`}>{range.label}</h2><p>{range.description}</p>{range.id === 'viewer' && <ProductFallback/>}{range.id === 'commerce' && <CommercePlaceholder/>}</div><span className="chapter-status">{range.id === 'alpine' ? 'SCROLL TO EXPLORE ↓' : 'SCENE CONTRACT READY'}</span></div>
        </section>)}
      </div>
      <div className="progress-track" aria-hidden="true"><div/></div>
    </main>
    <footer><span>AERIS X1</span><span>Development shell · No production assets</span><a href="#top">Back to top ↑</a></footer>
  </>;
}
