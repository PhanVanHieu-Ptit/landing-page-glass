import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { MathUtils, Vector3, type Group } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ASSETS } from '../../lib/product';
import { ProductModel } from './ProductModel';
import './ProductViewer.css';

export type ProductViewerProps = { progress: number; interactive?: boolean; modelUrl?: string; progressRef?: MutableRefObject<number>; onAvailabilityChange?: (ready: boolean) => void; onExplorationChange?: (active: boolean) => void };
const clamp = (n: number) => MathUtils.clamp(Number.isFinite(n) ? n : 0, 0, 1);
const HOME = new Vector3(0, 0.15, 5.2);

class ViewerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function ContextMonitor({ onLost }: { onLost: () => void }) {
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl, onLost]);
  return null;
}

function Scene({ progress, exploring, reduced, modelUrl, onReady, onDrag, progressRef, keyboardAngle }: {
  keyboardAngle: number; progressRef?: MutableRefObject<number>; progress: number; exploring: boolean; reduced: boolean; modelUrl: string;
  onReady: () => void; onDrag: (value: boolean) => void;
}) {
  const product = useRef<Group>(null);
  const controls = useRef<OrbitControlsImpl>(null);
  const dragging = useRef(false);
  const rendered = useRef(0);
  const invalidate = useThree(state => state.invalidate);
  const gl = useThree(state => state.gl);
  useEffect(() => {
    const host = gl.domElement.closest('.cinematic-landing');
    const redraw = () => { if (!document.hidden) invalidate(); };
    host?.addEventListener('cinematicframe', redraw);
    document.addEventListener('visibilitychange', redraw);
    invalidate();
    return () => {
      host?.removeEventListener('cinematicframe', redraw);
      document.removeEventListener('visibilitychange', redraw);
    };
  }, [gl, invalidate]);
  useEffect(() => {
    if (!exploring) { dragging.current = false; onDrag(false); }
    return () => { dragging.current = false; };
  }, [exploring, onDrag]);
  useFrame(({ camera }) => {
    if (rendered.current < 2) {
      if (++rendered.current === 2) onReady();
      else invalidate();
    }
    const reveal = clamp(((progressRef?.current ?? progress) - 0.5) / 0.22);
    const alpha = 1;
    if (!exploring && !dragging.current) {
      camera.position.lerp(HOME, alpha);
      if (controls.current) {
        controls.current.target.set(0, 0, 0);
        controls.current.update();
      }
      if (product.current) {
        product.current.rotation.y = MathUtils.lerp(product.current.rotation.y, reduced ? 0 : (1 - reveal) * -1.15, alpha);
        product.current.rotation.x = MathUtils.lerp(product.current.rotation.x, reduced ? 0 : (1 - reveal) * 0.16, alpha);
      }
    }
    if (product.current) {
      if (exploring) product.current.rotation.y = keyboardAngle;
      const size = reduced ? 1 : MathUtils.lerp(0.78, 1, reveal);
      product.current.scale.setScalar(size);
    }
  });
  return <>
    <ambientLight intensity={0.25} />
    <directionalLight position={[3, 4, 5]} intensity={2.2} color="#fff4e6" />
    <directionalLight position={[-4, 1, -3]} intensity={3} color="#c3e7ff" />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[8, 2, 1]} rotation={[Math.PI / 2, 0, 0]} />
      <Lightformer form="rect" intensity={2} position={[-4, 0, 1]} scale={[2, 5, 1]} rotation={[0, Math.PI / 2, 0]} />
      <Lightformer form="rect" intensity={3} position={[3, 1, -3]} scale={[2, 4, 1]} rotation={[0, -Math.PI / 4, 0]} />
    </Environment>
    <group ref={product}><ProductModel modelUrl={modelUrl} /></group>
    <OrbitControls ref={controls} enabled={exploring} enablePan={false} enableZoom={false}
      enableDamping={false} minPolarAngle={0.3} maxPolarAngle={Math.PI - 0.3}
      onStart={() => { dragging.current = true; onDrag(true); }}
      onEnd={() => { dragging.current = false; onDrag(false); }} />
  </>;
}

/** Progress is the global narrative value (0–1), not scene-local progress. */
export function ProductViewer({ progress, interactive = false, modelUrl, ...integration }: ProductViewerProps) {
  const url = modelUrl?.trim() || ASSETS.goggleModel.src || undefined;
  return <ViewerSession {...integration} key={url ?? 'placeholder'} progress={progress} interactive={interactive} modelUrl={url} />;
}

function ViewerSession({ progress, interactive, modelUrl, progressRef, onAvailabilityChange, onExplorationChange }: ProductViewerProps) {
  const [posterFailed, setPosterFailed] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [requested, setRequested] = useState(false);
  const [keyboardAngle, setKeyboardAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reduced, setReduced] = useState(false);
  const p = clamp(progress);
  const eligible = Boolean(interactive && p >= 0.72 && p <= 0.85 && ready && !failed);
  const exploring = eligible && requested;
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      setWebgl(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch { setWebgl(false); }
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => { if (!eligible) setRequested(false); }, [eligible]);
  useEffect(() => { onAvailabilityChange?.(ready && !failed); return () => onAvailabilityChange?.(false); }, [ready, failed, onAvailabilityChange]);
  useEffect(() => { onExplorationChange?.(exploring); return () => onExplorationChange?.(false); }, [exploring, onExplorationChange]);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);
  const poster = ASSETS.productPoster.src;
  const showCanvas = Boolean(webgl && modelUrl && !failed);
  const status = !modelUrl ? 'Development placeholder — approved 3D model not supplied.'
    : failed ? 'The 3D model could not be displayed.'
    : webgl === false ? '3D is unavailable on this device.'
    : !ready ? 'Loading product model…'
    : exploring ? dragging ? 'Rotating product' : 'Drag or use Left/Right arrows to rotate · Escape to return'
    : 'Scroll to reveal · Explore available at 72–85%';
  return <section className="product-viewer" aria-label="Ski-goggle product viewer"
    data-mode={exploring ? 'explore' : 'scroll'} onKeyDown={event => {
      if (event.key === 'Escape') setRequested(false);
      if (exploring && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        setKeyboardAngle(value => value + (event.key === 'ArrowLeft' ? -.15 : .15));
      }
    }}>
    {(!showCanvas || !ready) && <div className="product-viewer__fallback">
      {poster && !posterFailed ? <img onError={() => setPosterFailed(true)} src={poster} alt={ASSETS.productPoster.alt} /> : <div className="product-viewer__placeholder"><span aria-hidden="true">◇</span><p>DEVELOPMENT PLACEHOLDER</p><small>Approved product model and still image pending</small></div>}
    </div>}
    {showCanvas && <div className="product-viewer__canvas" style={{ opacity: ready ? 1 : 0, pointerEvents: exploring ? 'auto' : 'none', touchAction: exploring ? 'none' : 'pan-y' }}>
      <ViewerBoundary onError={markFailed}>
        <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0.15, 5.2], fov: 36, near: 0.05, far: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
          <ContextMonitor onLost={markFailed} />
          <Suspense fallback={null}><Scene keyboardAngle={keyboardAngle} progressRef={progressRef} progress={p} exploring={exploring} reduced={reduced}
            modelUrl={modelUrl!} onReady={markReady} onDrag={setDragging} /></Suspense>
        </Canvas>
      </ViewerBoundary>
    </div>}
    <div className="product-viewer__ui">
      <p role="status" aria-live="polite">{status}</p>
      {eligible && <button type="button" aria-pressed={exploring} onClick={() => setRequested(value => !value)}>
        {exploring ? 'Return to cinematic view' : 'Explore in 3D'}
      </button>}
      {failed && modelUrl && <button type="button" onClick={() => { if (modelUrl) useGLTF.clear(modelUrl); setReady(false); setFailed(false); }}>Retry viewer</button>}
    </div>
  </section>;
}

export default ProductViewer;
