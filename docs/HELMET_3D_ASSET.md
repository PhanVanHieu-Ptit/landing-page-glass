# Helmet photographic explorer

The Sketchfab iframe, SDK and unrelated reference model have been removed. The helmet now uses a local 2D photographic turntable, with the same `ExplorerControls` component and canvas dimensions as the goggles.

## Assets

- Identity reference and default view: `public/images/aeris-helmet-product.png` (unchanged).
- Eight-angle 4 × 2 transparent sprite: `public/images/aeris-helmet-turntable.png`.
- Top-down transparent image: `public/images/aeris-helmet-above.png`.
- Underside transparent image: `public/images/aeris-helmet-below.png`.

The generated assets were generated with built-in image_gen using the original image as a strict identity reference. Original image and generated assets were visually inspected. All images are bundled locally, with no third-party model/network dependency.

## Interaction

Horizontal mouse/touch dragging cycles through eight photographic angles. Vertical dragging down reveals the top; dragging up reveals the underside through nine elevation photographs. Both directions advance one photograph per 32px. Small pointer movement is accumulated, and updates are batched with requestAnimationFrame. Input is applied incrementally, including at elevation limits, so reversing at a pole responds immediately without undoing overshoot. A single gesture can change direction; there is no permanent initial-axis lock. Horizontal movement gently reduces remaining elevation rather than abruptly resetting it.

Only one photograph is drawn at a time; the former nine-layer opacity crossfade and 70ms trailing transition have been removed. Images are decoded before controls become available. Photos remain discrete views rather than a geometric 3D reconstruction.

Six labeled buttons select front/left/right/back/above/below; arrow keys and the original-photo button remain available. Zoom uses shared controls at 80–180%. Detail buttons crop the original image.

## Validation and limits

Production build and nine tests pass, including matching axis sensitivity, immediate reversal after overshoot, direction changes and accumulation of small movements. Browser runtime/subjective smoothness has not been verified in this environment. Hidden surfaces are AI interpretations and cannot guarantee exact physical reconstruction.
