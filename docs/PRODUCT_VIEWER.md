# Product viewer integration

The implementation is confined to `src/components/product/ProductViewer.tsx`,
`ProductViewer.css`, and `ProductModel.tsx`. The existing page still renders its
shell fallback; mount the viewer in the product stage when connecting the narrative.

```tsx
import { ProductViewer } from './components/product/ProductViewer';

<ProductViewer
  progress={globalProgress}
  interactive={true}
  modelUrl="/models/approved-goggles.glb"
/>
```

`progress` is finite normalized **global** narrative progress, clamped to 0–1.
0.50–0.72 drives a damped reveal rotation and scale. At 0.72–0.85 the Explore
button becomes available when `interactive` is true and the model has loaded.
Clicking it explicitly gives OrbitControls ownership of rotation. Scroll cannot
rotate the product throughout exploration, including during pointer drags.
Return to cinematic view, Escape, leaving the interval, or disabling `interactive`
releases control and smoothly restores the intended camera and product pose.
Reduced motion snaps automatic transitions; deliberate user rotation remains enabled.
Zoom and pan are disabled. Touch scroll remains available until exploration starts.

Connect a React progress state adapter to the narrative's global progress. Do not
call React setters from the existing `SceneController.update` callback: its contract
requires ref/DOM mutations. Instead publish progress via a separate subscribed
store or page-level adapter. The shell currently uses viewer range 0.66–0.86;
this component deliberately uses the requested 0.50–0.72 / 0.72–0.85 timings.
Mount it across both reveal and exploration, outside an `aria-hidden` stage, so its
buttons and status remain accessible. Lazy-load the component to keep Three.js out
of the initial page bundle when appropriate.

## Assets and appearance

Supply `modelUrl` or set `ASSETS.goggleModel.src`. GLB is preferable; GLTF external
buffers and textures must resolve relative to its URL and permit CORS. Draco and
Meshopt support use Drei's loader defaults; configure a self-hosted Draco decoder
via `useGLTF.setDecoderPath` before loading if required by CSP. KTX2-compressed
textures require a renderer-configured KTX2 loader before using those assets.

The viewer centers and uniformly scales the model without replacing materials,
textures, geometry, or authored node transforms. Author the asset with the front
facing +Z and Y up. PBR fidelity depends on the supplied asset: export physical
materials and correct color spaces from the authoring application. No tint or
invented detailed goggle model is applied. The environment is generated locally
using Lightformers; no remote HDRI or post-processing pipeline is required.

Set `ASSETS.productPoster.src` and its `alt` to the approved static image. It is
shown during loading, on model/render errors, and if WebGL2 is unavailable. With
neither asset supplied, an explicit development placeholder is shown. The viewer
cannot supply an authentic product photograph without that asset. Load errors
show a retry button; failed cached requests may require a new URL or page reload.

## Lifetime and verification

Drei owns its URL-keyed model cache. Each instance clones the hierarchy (including
skeletons) and shares immutable geometry/material/texture resources. `dispose={null}`
prevents one instance from invalidating another. Controls and environment resources
are disposed by R3F/Drei on unmount; context listeners and media-query listeners
are explicitly removed. For applications cycling through many unique models,
evict and dispose cached assets only after **all** their consumers have unmounted;
`useGLTF.clear(url)` alone does not dispose GPU resources.

DPR is capped at 1.5, environment resolution is 128, and shadows and post-processing
are omitted. Rendering uses R3F's continuous loop for damped animation.

Before launch, inspect the actual approved model on desktop and mobile: front pose,
lens transmission/reflections, loading and invalid URLs, context loss, no WebGL,
keyboard handoff, touch scrolling, resizing, reduced motion, two viewer instances,
and leaving the exploration interval mid-drag. Use an approved poster for fallback
checks. A build verifies types but cannot establish visual material fidelity.
