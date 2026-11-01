# AERIS X1 production-readiness audit

Date: 2026-11-01. Verdict: **not ready for production sign-off**.

This is a source, TypeScript, test and production-bundle audit. Browser execution was unavailable: tool discovery exposed no browser JavaScript execution tool. No desktop/mobile screenshots, physical touch tests, runtime performance traces, FPS, Core Web Vitals, GPU memory or draw-call measurements were obtained. Reproduction steps below describe source-confirmed defects and follow-up browser checks; they are not claims that browser scenarios were executed.

## Confirmed issues, reproduction and changes

| Severity | Issue and reproduction before fixes | Verified cause | Change |
| --- | --- | --- | --- |
| High | Load the entry page: the full 3D dependency graph is included immediately. | LandingPage statically imported ProductViewer, which imports Fiber, Drei and Three. | Dynamic import behind Suspense; mount from isolation onward. Chunk failures are contained by a boundary. |
| High | With a valid model, leave the viewer stationary, including while covered by other scenes. | Canvas used the default continuous frame loop. | Demand rendering; cinematic frame events and visibility restoration invalidate frames; OrbitControls invalidates on changes. Startup requests its second readiness frame explicitly. |
| High | Scrub opening 0–30% and reveal 50–72%: several copy cues never appear. | Overlay received one cue value per canonical scene rather than actual progress. | Overlay subscribes to absolute cinematic progress, independently of page scene state. |
| High | Use a broken film URL. | No video error handler. | Retain the existing static narrative stage on film failure; reduced motion uses the static stage. |
| Medium | Use a broken poster URL in viewer or commerce. | Image errors had no alternate rendering. | Viewer falls back to its placeholder; commerce falls back to its existing concept illustration. |
| Medium | Rapidly scrub a configured film forward and backward. | Every update could issue a new seek while one was already pending; end progress requested exact duration. | Coalesce pending seeks; resync after seek completion; guard unseekable media and clamp below duration. Actual codec/decoder latency remains unmeasured. |
| High | At purchase, click controls under the floating product layer. | Absolutely positioned product layer sat above commerce and accepted pointer events. | Product host ignores pointers; exploration canvas and explicit viewer buttons opt in. |
| Medium | Enter 3D exploration using keyboard and try to rotate. | Orbit interaction was pointer-only. | Left/Right arrows rotate the product while exploring; Escape exits; existing button remains focusable. |
| Medium | Fail a GLB request, then retry. | Suspense loader can cache the rejected model request. | Clear that URL from useGLTF cache before remounting the failed viewer. |
| Medium | Restore the page from browser history. | No explicit pageshow resynchronization. | Schedule ScrollTrigger refresh on pageshow; remove listener on cleanup. |
| Medium | Read headings with a screen reader, including when film replaces the stage. | Only h1 was in a visually hidden stage or absent with film. | Add a persistent visually hidden product h1. Mark the faded cinematic copy inaccessible in commerce. |
| Medium | Enable reduced motion and enter isolation. | Opening opacity still scrubbed across a continuous interval. | Opening transition becomes a discrete step; film is replaced by static stage; existing model pose and docking already use reduced-motion paths. |

Source cleanup reviewed: GSAP contexts revert, timelines are killed, ResizeObserver disconnects, pending refresh RAF is canceled, media/font callbacks guard disposal, WebGL context listener is removed, and Canvas owns renderer lifecycle. No runtime lifecycle verification was possible. Shared GLTF cache resources deliberately remain cached; repeated arbitrary model URLs would need an explicit cache-eviction policy.

## Validation and measured build results

`npm test`: **4/4 pass**. Tests cover canonical boundaries, clamping, forward/reverse scene selection, and repeatable frames after large arbitrary jumps. These tests validate pure scene mapping, not actual DOM animation, video seeking, or GPU output.

`npm run build`: **passes**, including TypeScript. Final Vite build reported 1.87 seconds; this is one local build observation, not a benchmark.

| Artifact | Before | After |
| --- | ---: | ---: |
| Entry JavaScript | 1,393.77 kB | 357.95 kB |
| Entry JavaScript gzip | 409.28 kB | 122.47 kB |
| Deferred viewer JavaScript | Included in entry | 1,034.89 kB / 286.64 kB gzip |

Entry gzip falls about 70%. Overall transferred JavaScript after opening 3D is approximately unchanged. The deferred chunk still triggers Vite's >500 kB warning. These are build artifact sizes, not measured network transfer, loading time or responsiveness.

Configured GPU controls: DPR capped at 1.5, low-power renderer preference, 128-pixel one-frame environment capture, no enabled shadow maps, no per-frame temporary vectors after changes. Model texture sizes, geometry complexity, material count and draw calls cannot be audited without the actual GLB. No automatic reduction of authored texture quality was applied.

## Required browser acceptance matrix

All rows below remain **unexecuted**. Run against the production build with approved assets on representative desktop hardware and a physical mobile device.

| Scenario | Procedure and acceptance |
| --- | --- |
| Desktop/mobile rendering | Check 1440×900, 1024×768, 390×844, 320×568 and mobile landscape. Verify copy, hotspot panels, viewer UI and all purchase controls remain reachable with no horizontal overflow. |
| Slow/fast/reverse scroll | Traverse every boundary (30, 50, 72, 85%) slowly, jump directly between chapters, then reverse. Compare equivalent positions for identical opacity, pose, copy and docking. |
| Resize mid-animation | Resize in each scene, including mobile rotation and short landscape viewports. Verify camera aspect, dock position and content scrollability. |
| Mid-scroll refresh | Reload around 40, 60, 78 and 95%, including #purchase. Confirm restored frame, model readiness, correct copy and inactive control exclusion. |
| Touch | Swipe through chapters, enter exploration, rotate, exit and resume scrolling. Verify scroll isn't trapped and commerce's nested scroller reaches all controls. |
| Reduced motion | Enable before load and toggle during reveal. Confirm static opening, discrete scene changes, fixed product pose and no unwanted interpolation. |
| WebGL unavailable/context loss | Disable WebGL before load; separately lose context during reveal. Confirm static fallback, usable commerce and safe retry. |
| Asset failures | Block film, poster, GLB and viewer chunk separately. Confirm each fallback, no page crash, and GLB retry after restoring service. |
| Navigation away/back | Repeat history back/forward and page remounts; compare listener counts, active ScrollTriggers, canvas contexts and GPU resources. |
| Keyboard/accessibility | Tab from skip link through purchase; operate radios, quantity and hotspots; enter 3D, use arrows and Escape. Verify focus remains visible when scenes change, and screen-reader reading order. |
| Performance | Record cold/warm loads and long fast-scroll traces on actual target hardware. Measure long tasks, dropped frames, layout shifts and GPU draw calls/textures before setting release budgets. |

## Remaining release blockers and limitations

- `ASSETS` has null film, model and poster sources. No image sequence implementation or sequence assets exist. Film/3D silhouette continuity is explicitly uncalibrated. Approved media must be supplied and checked at each viewport.
- Pricing, inventory, variant IDs and claims are placeholders. The landing page supplies no cart adapter, so Add to cart is correctly disabled. This is not a completed transactional experience.
- Lazy chunk download has a fallback but requires a page reload after a chunk-load failure; no automatic chunk retry is provided.
- Real GLB texture resolution, compression, draw calls, decoder cost and GPU residency remain unknown. Demand rendering reduces idle rendering by design but runtime savings are unmeasured.
- Dock measurement uses DOM bounds at refresh; scrolling the purchase panel's inner scroller can move its dock without a refresh. Validate this with a real model on short viewports before release.
- Copy state updates on cinematic frames; profile React work with real media. Layout-affecting width/height changes remain during the docking interval to preserve the intended responsive composition.
- Video loading uses metadata preload only. Range-request support, codec compatibility, keyframe spacing, reverse seeking and a critical poster strategy require final media and hosting validation. No speculative full-film or GLB preload was added.
- Visual accessibility, contrast, focus transitions, Safari behavior, WebGL failure recovery, BFCache restoration and reduced-motion comfort require browser/device validation. The static fallback is a development composition until approved stills arrive.

Existing uncommitted implementation work was preserved; no commits, deployments or art-direction redesigns were made.
