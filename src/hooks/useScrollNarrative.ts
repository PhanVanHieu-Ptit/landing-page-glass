import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameFor, SCENE_RANGES } from '../animations/timeline';
import type { MotionMode, SceneController, SceneId, ViewportMode } from '../lib/contracts';
gsap.registerPlugin(ScrollTrigger);
export function useScrollNarrative(root: RefObject<HTMLElement | null>, controllers: ReadonlyMap<SceneId, SceneController>, motion: MotionMode, viewport: ViewportMode) {
  useLayoutEffect(() => {
    if (!root.current) return;
    const context = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
        onUpdate: self => {
          root.current?.style.setProperty('--progress', String(self.progress));
          for (const range of SCENE_RANGES) controllers.get(range.id)?.update(frameFor(range, self.progress, motion, viewport));
        },
      });
      const progress = ScrollTrigger.getAll().find(t => t.trigger === root.current)?.progress ?? 0;
      for (const range of SCENE_RANGES) controllers.get(range.id)?.update(frameFor(range, progress, motion, viewport));
    }, root);
    return () => { context.revert(); controllers.forEach(controller => controller.dispose()); };
  }, [root, controllers, motion, viewport]);
}
