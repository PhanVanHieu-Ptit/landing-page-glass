/** Kept independent of Canvas so missing assets or WebGL never hide product information. */
export function ProductFallback() {
  return <div className="product-fallback"><span className="eyebrow">AERIS X1</span><p>Product visualization pending</p><small>Approved model and still image have not been supplied. The 3D viewer is not loaded in this shell.</small></div>;
}
