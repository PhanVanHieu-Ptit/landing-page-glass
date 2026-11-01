import { memo, forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import './IsolationScene.css';

export type IsolationSceneProps = { progress: number };
export type IsolationSceneHandle = {
  /** Preferred frame path: call from the existing ScrollTrigger, without setState. */
  update(progress: number): void;
  /** Set only after a separate, persistent product layer has rendered successfully. */
  setProductReady(ready: boolean): void;
};

/**
 * TRANSITION / INTEGRATION CONTRACT
 * Mount once in the persistent stage, above the environment and BELOW the existing
 * product Canvas/cutout. This component owns only its masks and lights, never the
 * product pose, video time, camera, or another ScrollTrigger. Stage stacking order:
 * environment (0), IsolationScene (1), persistent product (2), semantic UI (3).
 * Pass global progress, including while inactive; don't map the dissolve chapter's
 * localProgress. These overlap windows intentionally span the canonical chapters.
 * Use ref.update(frame.progress) for frame updates; `progress` initializes and also
 * supports declarative callers (whose parent will necessarily render on changes).
 *
 * A film with goggles baked into its pixels cannot preserve a silhouette under
 * these masks. Supply an approved alpha extraction or the SAME persistent product
 * above this layer from the outset. Before enabling a film→3D handoff, calibrate
 * lens contour, optical center, projected scale, camera FOV, pose, crop and lighting
 * at each viewport against a reference frame. Keep the product transform owner
 * unchanged and use a shared contour matte during the overlap. No matched assets
 * or calibration are present here, so this component performs NO asset swap and
 * makes NO claim of exact film/3D continuity. setProductReady is availability only,
 * not an assertion of alignment. Leave it false on load error/context loss.
 * FALLBACK: while false, masks/lights are hidden and the environment remains
 * visible. The host retains its existing asset-pending label. Never black out a
 * baked-in product without a verified persistent foreground product.
 * Call setProductReady(true) only after its first successful rendered frame;
 * call false before removing it. Readiness must not change during a handoff.
 * Keep scene mounted after .50; unmounting would expose the environment again.
 * Optional CSS --isolation-focus-x/y place the light at the product optical center;
 * these are art direction controls, not asset alignment calibration.
 *
 * No media requests, RAF loop or global mutations. GSAP context is disposed on unmount/StrictMode replay. No time-dependent smoothing:
 * seeking backwards or jumping directly to any progress yields the same frame.
 */
export const ISOLATION_TRANSITION = {
  environment: [0.30, 0.38],
  blackout: [0.38, 0.45],
  isolated: [0.45, 0.50],
  background: '#020304',
  requiresSeparateProductLayer: true,
  calibratedHandoffAvailable: false,
} as const;

const clamp = (p: number) => Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 0;

export const IsolationScene = memo(forwardRef<IsolationSceneHandle, IsolationSceneProps>(
  function IsolationScene({ progress }, forwardedRef) {
    const root = useRef<HTMLDivElement>(null);
    const timeline = useRef<gsap.core.Timeline | null>(null);
    const latest = useRef(clamp(progress));
    const renderFrame = (value: number) => {
      const p = clamp(value);
      latest.current = p;
      // Absolute seeking makes reverse scroll and large jumps history-independent.
      timeline.current?.time(p, true);
      if (root.current) root.current.dataset.active = String(p >= 0.30);
    };

    useImperativeHandle(forwardedRef, () => ({
      update: renderFrame,
      setProductReady: ready => {
        if (root.current) root.current.dataset.productReady = String(ready);
      },
    }), []);

    useLayoutEffect(() => {
      const host = root.current;
      if (!host) return;
      const context = gsap.context(() => {
        const select = gsap.utils.selector(host);
        const tl = gsap.timeline({ paused: true });
        timeline.current = tl;
        // All initial states are explicit, so reverse seeks never depend on history.
        tl.set(select('.isolation-scene__veil'), { opacity: 0 }, 0)
          .set(select('.isolation-scene__shutter--left'), { xPercent: -102 }, 0)
          .set(select('.isolation-scene__shutter--right'), { xPercent: 102 }, 0)
          .set(select('.isolation-scene__shutter--top'), { yPercent: -102 }, 0)
          .set(select('.isolation-scene__shutter--bottom'), { yPercent: 102 }, 0)
          .set(select('.isolation-scene__matte'), { opacity: 0 }, 0)
          .set(select('.isolation-scene__light'), { opacity: 0, scale: 1.12 }, 0)
          // Peripheral extinction precedes full-field black, rather than a crossfade.
          .to(select('.isolation-scene__veil'), { opacity: 1, duration: 0.08, ease: 'sine.inOut' }, 0.30)
          .to(select('.isolation-scene__shutter--left'), { xPercent: 0, duration: 0.12, ease: 'power2.inOut' }, 0.31)
          .to(select('.isolation-scene__shutter--right'), { xPercent: 0, duration: 0.12, ease: 'power2.inOut' }, 0.32)
          .to(select('.isolation-scene__shutter--top'), { yPercent: 0, duration: 0.10, ease: 'power2.inOut' }, 0.33)
          .to(select('.isolation-scene__shutter--bottom'), { yPercent: 0, duration: 0.10, ease: 'power2.inOut' }, 0.34)
          .to(select('.isolation-scene__matte'), { opacity: 1, duration: 0.07, ease: 'sine.inOut' }, 0.38)
          .to(select('.isolation-scene__light'), { opacity: 0.18, scale: 1, duration: 0.05, ease: 'sine.out' }, 0.40)
          .to(select('.isolation-scene__light'), { opacity: 0, scale: 0.94, duration: 0.05, ease: 'sine.inOut' }, 0.45);
      }, host);
      renderFrame(latest.current);
      return () => {
        timeline.current = null;
        context.revert();
      };
    }, []);

    useLayoutEffect(() => { renderFrame(progress); }, [progress]);

    return <div ref={root} className="isolation-scene" data-active="false" data-product-ready="false" aria-hidden="true">
      <div className="isolation-scene__veil" />
      <div className="isolation-scene__shutter isolation-scene__shutter--left" />
      <div className="isolation-scene__shutter isolation-scene__shutter--right" />
      <div className="isolation-scene__shutter isolation-scene__shutter--top" />
      <div className="isolation-scene__shutter isolation-scene__shutter--bottom" />
      <div className="isolation-scene__matte" />
      <div className="isolation-scene__light" />
    </div>;
  },
));
