import gsap from 'gsap';
import { clamp01 } from './timeline';

export const CINEMATIC_INTERVALS = [
  { id: 'opening', start: 0, end: 0.30, cue: 0.1 },
  { id: 'isolation', start: 0.30, end: 0.50, cue: 0.40 },
  { id: 'reveal', start: 0.50, end: 0.72, cue: 0.56 },
  { id: 'exploration', start: 0.72, end: 0.85, cue: 0.75 },
  { id: 'purchase', start: 0.85, end: 1, cue: 0.95 },
] as const;
export function cinematicFrame(value: number) {
  const progress = clamp01(value);
  const index = CINEMATIC_INTERVALS.findIndex(scene => progress < scene.end);
  const sceneIndex = index < 0 ? 4 : index;
  const scene = CINEMATIC_INTERVALS[sceneIndex];
  return { progress, sceneIndex, scene, local: clamp01((progress - scene.start) / (scene.end - scene.start)) };
}

/** Paused absolute timeline: ScrollTrigger is the only clock. CSS sticky owns layout. */
export function createMasterTimeline(root: HTMLElement, reduced: boolean) {
  const opening = root.querySelector<HTMLElement>('[data-opening]')!;
  const product = root.querySelector<HTMLElement>('[data-product-layer]')!;
  const commerce = root.querySelector<HTMLElement>('[data-commerce-layer]')!;
  const overlay = root.querySelector<HTMLElement>('[data-overlay-layer]')!;
  const viewport = root.querySelector<HTMLElement>('[data-cinematic-viewport]')!;
  const dock = root.querySelector<HTMLElement>('[data-product-dock]')!;
  const timeline = gsap.timeline({ paused: true });
  timeline.fromTo(opening, { opacity: 1 }, { opacity: 0, duration: reduced ? .001 : .20, ease: 'none' }, .30)
    .fromTo(product, { opacity: 0 }, { opacity: 1, duration: reduced ? .001 : .08, ease: 'none' }, .45)
    .fromTo(overlay, { opacity: 1 }, { opacity: 0, duration: reduced ? .001 : .05, ease: 'none' }, .80)
    .fromTo(commerce, { opacity: 0 }, { opacity: 1, duration: reduced ? .001 : .06, ease: 'none' }, .85)
    .to({}, { duration: .09 }, .91);
  let bounds = { x: 0, y: 0, width: 1, height: 1 };
  function measure() {
    // Transforms are applied to the viewer, never to the dock target.
    const stage = viewport.getBoundingClientRect();
    const target = dock.getBoundingClientRect();
    bounds = { x: target.left - stage.left, y: target.top - stage.top, width: target.width, height: target.height };
  }
  measure();
  return {
    measure,
    update(value: number, available: boolean) {
      const p = clamp01(value);
      timeline.time(p, true);
      const t = reduced ? Number(p >= .85) : clamp01((p - .85) / .15);
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      // Resize the persistent Canvas with its DOM host; its camera aspect follows R3F.
      gsap.set(product, { x: bounds.x * t, y: bounds.y * t,
        width: width + (bounds.width - width) * t, height: height + (bounds.height - height) * t });
      product.inert = p < .72 || p >= .85;
      commerce.inert = p < .85;
      dock.dataset.docked = String(available && p >= 1);
      overlay.inert = p >= .85;
      overlay.setAttribute('aria-hidden', String(p >= .85));
      root.style.setProperty('--progress', String(p));
      root.dispatchEvent(new Event('cinematicframe'));
    },
    dispose() { timeline.kill(); dock.removeAttribute('data-docked'); },
  };
}
