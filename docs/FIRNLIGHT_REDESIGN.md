# Firnlight reference → AERIS X1

Reference: https://www.scrolltide.co/templates/firnlight

## Reference analysis

The supplied hash identifies Firnlight, not the Scrolltide library homepage. Its public preview shows a full-screen alpine athlete, minimal navigation, a large black wordmark near the lower edge, a transition to a black product stage, an orbit/detail close-up, and a product purchase conclusion. The dominant palette is snow white, black, and an iridescent gold/magenta/violet lens. Motion and product imagery carry the experience; copy is sparse.

## Existing project

React 19 + Vite + TypeScript, GSAP scroll orchestration, and optional React Three Fiber product viewing. The initial asset manifest contained no athlete film, product GLB, or product still. The earlier opening and product stages consequently rendered development placeholders. Existing viewer modules and timeline utilities are retained for future production asset integration. The current entry page uses a self-contained GSAP presentation and local generated imagery.

## Implemented

- Retained AERIS X1 identity; replaced the green placeholder opening with an original snow editorial image and oversized lower-edge product typography.
- Sticky scroll presentation: image push-in, fade to black, isolated product entrance, perspective transform and detail enlargement, return to the product framing.
- Responsive product section with three illustrative finish previews, expandable design details, and honest coming-soon availability.
- Our Story dialog with focus containment, Escape dismissal, focus restoration and background scroll lock.
- Mobile layouts, keyboard controls and reduced-motion layout that skips the long sticky presentation.
- No payment, inventory, product-performance promises or fake checkout.

## Limits

The implementation uses generated stills and CSS perspective transformations, not an athlete pulling goggles onto her face, a matched film-to-3D extraction, or a true 3D orbit. Those need coordinated source footage/frame sequence and a matching product model. The original premium source/prompt was not accessed. The public preview was inspected as reference only and is not shipped with the application.

Finish selections are hue-based visual concepts, not validated SKU photography.

## Assets

Generated with the built-in Imagegen tool; project-local copies are used at runtime.

- `public/images/aeris-alpine.jpg`: JPEG conversion of the generated editorial hero.
- `public/images/aeris-goggles.png`: generated transparent product cutout, alpha preserved.

Hero prompt: premium photorealistic editorial landscape close-up of an adult female alpine skier in a white technical hooded jacket and white gloves, leaning toward camera in pale blue snowy overcast alpine conditions. Oversized frameless spherical goggles, reflective gold-orange-magenta-violet lens, thin black rim and white strap, one hand touching the goggles. Natural light, realistic fabric and ice details, pale negative space for dark typography. No text, logos or watermark.

Product prompt: isolated photorealistic oversized spherical frameless ski goggles, graphite frame, mirrored gold-orange through magenta to violet-blue lens, white woven elastic strap with tonal mountain chevrons. Front three-quarter view showing right side and strap. Entire product centered, realistic studio reflections, transparent background, no person, text, logos, extra objects or ground shadow.

## Verification

- `npm run build`: TypeScript and Vite production build pass.
- `npm test`: 4 existing timeline tests pass; these cover the retained timeline utilities, not the new page animation.
- Brave headless browser: 1440×900 and 390×844 screenshots reviewed; all images load; no horizontal overflow; product reveal, finish selection and expandable details pass.
- Desktop story dialog opens and closes with Escape.
- Reduced-motion mobile presentation uses a single viewport instead of a long scroll sequence.
- No browser runtime exceptions observed.

## Interactive product explorer

The product section now includes a procedural Three.js concept model with curved lens geometry, frame, backing, side attachments, strap and rear buckle. Five camera presets expose the front, left, right, back and top. OrbitControls supports mouse/touch rotation; buttons provide zoom and reset; Left/Right keys cycle presets. Finish selection updates lens and strap materials. This replaces the product-section still; the opening cinematic continues using its generated image. The model is an illustrative design study, not a production GLB or calibrated reconstruction of the photo.

Browser verification at 1440×900 and 390×844: all five presets, drag rotation, zoom, reset, finish selection and horizontal layout pass with no runtime errors. The 3D bundle loads through a separate dynamic import. The production build emits a size advisory for the Three.js chunk.
