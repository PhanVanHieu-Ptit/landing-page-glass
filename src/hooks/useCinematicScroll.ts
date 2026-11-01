import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cinematicFrame, createMasterTimeline } from '../animations/masterTimeline';
import type { IsolationSceneHandle } from '../components/cinematic/IsolationScene';
gsap.registerPlugin(ScrollTrigger);

type Options = {
  root: RefObject<HTMLElement | null>;
  isolation: RefObject<IsolationSceneHandle | null>;
  progress: RefObject<number>;
  available: RefObject<boolean>;
  reduced: boolean;
  onScene: (index: number) => void;
};
export function useCinematicScroll({ root, isolation, progress, available, reduced, onScene }: Options) {
  const refresh = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    let previous = -1;
    let raf = 0;
    let disposed = false;
    let master: ReturnType<typeof createMasterTimeline>;
    const context = gsap.context(() => {
      master = createMasterTimeline(host, reduced);
      const update = (p: number) => {
        const frame = cinematicFrame(p);
        progress.current = frame.progress;
        const film = host.querySelector('video');
        if (film && Number.isFinite(film.duration) && film.duration > 0) {
          const time = reduced ? 0 : Math.min(1, frame.progress / .3) * Math.max(0, film.duration - .001);
          if (Math.abs(film.currentTime - time) > .04 && !film.seeking) {
            try { film.currentTime = time; } catch { /* Keep the poster if media is not seekable yet. */ }
          }
        }
        master.update(frame.progress, available.current);
        isolation.current?.update(reduced ? (p >= .5 ? .5 : 0) : p);
        if (previous !== frame.sceneIndex) { previous = frame.sceneIndex; onScene(previous); }
      };
      const trigger = ScrollTrigger.create({ trigger: host, start: 'top top', end: 'bottom bottom',
        invalidateOnRefresh: true, onUpdate: self => update(self.progress),
        onRefresh: self => { master.measure(); update(self.progress); } });
      update(trigger.progress);
      refresh.current = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { if (!disposed) trigger.refresh(); });
      };
    }, host);
    const observer = new ResizeObserver(() => refresh.current());
    observer.observe(host);
    host.querySelectorAll('[data-product-dock], [data-cinematic-viewport]').forEach(node => observer.observe(node));
    const resync = () => requestRefresh();
    window.addEventListener('pageshow', resync);
    host.addEventListener('load', refresh.current, true);
    host.addEventListener('loadedmetadata', refresh.current, true);
    host.addEventListener('seeked', refresh.current, true);
    const requestRefresh = refresh.current;
    document.fonts.ready.then(() => { if (!disposed) requestRefresh(); });
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      window.removeEventListener('pageshow', resync);
      host.removeEventListener('load', requestRefresh, true);
      host.removeEventListener('loadedmetadata', requestRefresh, true);
      host.removeEventListener('seeked', requestRefresh, true);
      refresh.current = () => {};
      master?.dispose(); context.revert();
    };
  }, [root, isolation, progress, available, reduced, onScene]);
  return refresh;
}
