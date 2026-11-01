import { useId, useRef, useState, type CSSProperties } from 'react';
import './ProductHotspots.css';

export type ProductHotspotsProps = {
  active: boolean;
  selectedFeature?: string | null;
  onFeatureChange?: (feature: string | null) => void;
};

export type ProductFeatureId = 'lens' | 'ventilation' | 'frame' | 'strap';
export type ProductFeature = {
  id: ProductFeatureId;
  title: string;
  description: string;
  /** Percentage coordinates for a fixed, front-facing product composition. */
  marker: Readonly<{ x: number; y: number }>;
  /** Semantic request only: the parent resolves this to its own camera preset. */
  cameraTarget: 'lens' | 'ventilation' | 'frame' | 'strap';
  contentStatus: 'placeholder';
};

/** Marketing copy AND marker positions require approval against the final model.
 * These screen-space anchors do not track an orbiting model. The parent must
 * use a matching fixed product pose, or deactivate this overlay during rotation.
 */
export const PRODUCT_FEATURES = [
  { id: 'lens', title: 'Lens technology', description: 'Explore a lens concept focused on a clear view of the terrain. Optical specifications and performance are awaiting verification.', marker: { x: 43, y: 49 }, cameraTarget: 'lens', contentStatus: 'placeholder' },
  { id: 'ventilation', title: 'Ventilation system', description: 'Explore the proposed airflow channels around the lens. Ventilation design and fog-management claims are awaiting verification.', marker: { x: 51, y: 29 }, cameraTarget: 'ventilation', contentStatus: 'placeholder' },
  { id: 'frame', title: 'Frame construction', description: 'Explore the frame concept and its connection to the lens. Materials, flexibility, and durability are awaiting verification.', marker: { x: 65, y: 64 }, cameraTarget: 'frame', contentStatus: 'placeholder' },
  { id: 'strap', title: 'Adjustable strap', description: 'Explore the proposed strap adjustment and fit. Adjustment range, materials, and helmet compatibility are awaiting verification.', marker: { x: 81, y: 43 }, cameraTarget: 'strap', contentStatus: 'placeholder' },
] as const satisfies readonly ProductFeature[];

/** Mount inside a position:relative product stage with a defined height.
 * Pass selectedFeature (including null) for controlled selection; omit it for
 * local state. Unknown IDs render as no selection. active=false hides all UI
 * without discarding selection or emitting callbacks.
 * onFeatureChange emits only user requests (including null for dismissal).
 * The parent may look up PRODUCT_FEATURES[id].cameraTarget and decide whether
 * to move its camera. This component never accesses the camera or timeline.
 */
export function ProductHotspots({ active, selectedFeature, onFeatureChange }: ProductHotspotsProps) {
  const [localFeature, setLocalFeature] = useState<string | null>(null);
  const instanceId = useId();
  const buttons = useRef<Partial<Record<ProductFeatureId, HTMLButtonElement | null>>>({});
  const selection = selectedFeature === undefined ? localFeature : selectedFeature;
  const feature = PRODUCT_FEATURES.find(item => item.id === selection);
  const panelId = `${instanceId}-feature`;
  const titleId = `${instanceId}-title`;

  function select(next: string | null) {
    if (selectedFeature === undefined) setLocalFeature(next);
    onFeatureChange?.(next);
  }

  function dismiss() {
    if (!feature) return;
    buttons.current[feature.id]?.focus();
    select(null);
  }

  return <section className="product-hotspots" aria-label="Explore product features" hidden={!active}
    onKeyDown={event => {
      if (event.key === 'Escape' && feature) {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }
    }}>
    <div className="product-hotspots__markers" role="group" aria-label="Select a feature">
      {PRODUCT_FEATURES.map((item, index) => <button key={item.id}
        ref={node => { buttons.current[item.id] = node; }}
        type="button" className="product-hotspots__marker"
        style={{ '--hotspot-x': `${item.marker.x}%`, '--hotspot-y': `${item.marker.y}%` } as CSSProperties}
        aria-label={item.title} aria-expanded={feature?.id === item.id}
        aria-controls={panelId}
        onClick={() => select(feature?.id === item.id ? null : item.id)}>
        <span className="product-hotspots__dot" aria-hidden="true">{index + 1}</span>
        <span className="product-hotspots__label" aria-hidden="true">{item.title}</span>
      </button>)}
    </div>
    <div className="product-hotspots__details" aria-live="polite" aria-atomic="true">
      <div id={panelId} hidden={!feature}>
        {feature && <article key={feature.id} className="product-hotspots__panel" aria-labelledby={titleId}>
          <div className="product-hotspots__heading">
            <h3 id={titleId}>{feature.title}</h3>
            <button type="button" className="product-hotspots__close" aria-label={`Close ${feature.title}`} onClick={dismiss}>×</button>
          </div>
          <p>{feature.description}</p>
          <small>Placeholder marketing content · Not verified</small>
        </article>}
      </div>
    </div>
  </section>;
}

export default ProductHotspots;
