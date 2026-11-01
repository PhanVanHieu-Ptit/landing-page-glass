# AERIS X1 integration contracts

This is task 1: architecture and working narrative shell. The backdrop is an abstract CSS placeholder. There is no athlete footage, finished product render, working 3D viewer or checkout. All six chapter descriptions are semantic HTML; they are not six implemented scenes.

## Ownership and file boundaries

- Narrative owner: `animations/timeline.ts`, `hooks/useScrollNarrative.ts`, `pages/ProductPage.tsx`. One ScrollTrigger owns normalized progress; no scene creates another scroll trigger or smooth-scroll loop.
- Film developer: `components/cinematic/`, `scenes/`. Alpine, equip and dissolve share a single persistent media layer. Supply footage, posters, error handling and a deterministic progress-to-time mapping. Avoid issuing overlapping asynchronous video seeks; prefer an approved image sequence if accurate scrubbing is required.
- Product developer: `components/product/`, `scenes/`. Use one persistent R3F Canvas and one product instance for approach, viewer and docking. Never remount on chapter boundaries. Drei controls may attach only during viewer activation. Load the GLB lazily; show ProductFallback on unsupported WebGL, loading failure or context loss. Add an error boundary around Canvas. Canvas and Three dependencies are installed, intentionally not mounted yet.
- Commerce developer: `components/commerce/`. Dock into a measured DOM anchor. Supply semantic controls and stock/pricing from an explicit commerce contract. No simulated successful purchase.
- Shared controls: `components/ui/`. Viewer requires keyboard rotation, reset and labeled instructions, not pointer-only orbit.

These boundaries support parallel development without parallel ownership of the timeline or product transforms. Coordinate shared-contract changes before editing others' files. No separate agent work was performed for this task.

## Lifecycle and timing

Implement `SceneContract.mount(host, context)` returning `SceneController`. Mount once inside a scoped lifecycle, register by SceneId, then call update with `frameFor` from the central controller. Dispose media listeners, GSAP contexts, Three resources and controls on unmount, media-query changes and StrictMode replay. Controllers must be reusable after cleanup or be recreated by their mounting effect. The shell's simple DOM adapters have no resources to dispose.

`SceneFrame.progress` is global [0,1]; `localProgress` is clamped [0,1]. `active` uses half-open intervals, with the final endpoint belonging to commerce. Updates must be deterministic when seeking backwards or jumping directly to a chapter. Inactive scenes still receive updates: use clamped local progress for correct endpoints; `active` controls hit testing and controls, not final visual visibility. Overlap/crossfade windows belong in local animation maps; do not change canonical ranges silently.

| Scene | Range | Output responsibility |
| --- | --- | --- |
| alpine | 0–0.20 | Athlete/environment establish |
| equip | 0.20–0.36 | Goggles aligned on athlete |
| dissolve | 0.36–0.48 | Environment → black; product handoff |
| approach | 0.48–0.66 | Isolated product → camera |
| viewer | 0.66–0.86 | User controls enabled |
| commerce | 0.86–1 | Same product → measured commerce anchor |

The narrative's scrollable distance is its height minus viewport height. Desktop shell: 600svh; mobile: 480svh. Chapter flex weights mirror the ranges. The stage is sticky, not separately pinned. Keep the stage mounted and avoid adding full-screen section backgrounds. Do not use React state for frame-by-frame transforms. Mutate object refs, CSS properties or GSAP timelines. React state is appropriate for infrequent asset and selection status.

## Identity and assets

`lib/contracts.ts` defines shared types. `lib/product.ts` owns product identity and the asset manifest. Units for the future model: meters; origin at optical center; lens faces +Z, +Y up. Rotation is radians in XYZ order. `ProductHandle` is the single transform/interaction interface; one owner writes a transform at a time. Viewer rotation must be reconciled before commerce takeover. Match the approved GLB to PRODUCT colors; current color values are provisional art direction.

Every asset begins with null src and placeholder status. Future assets need source/provenance, license, loading/error state and accessible descriptive fallback. Reserve dimensions before loading and never disguise a placeholder as completed film. Do not request remote HDRIs or models implicitly at runtime.

## Responsive and accessible behavior

Context supplies desktop/mobile and full/reduced motion. Match JS breakpoint to CSS (767px). Recompute camera fit and dock coordinates on resize without layout shifts. Reduced motion uses a compact, static document outline; future scenes must use posters and static product placement with no automatic orbit, scrubbed film or camera travel. Semantic chapter copy stays available without WebGL. Decorative stage is aria-hidden, so controls must be mounted outside it or explicitly reorganize the accessibility structure. Do not announce scroll updates via live regions. Pause hidden media, disable offscreen hit testing and expose keyboard equivalents for viewer controls. Test WebGL denied, model/media failure, mobile rotation, keyboard navigation, backward scrubbing and motion preference changes before final integration.
