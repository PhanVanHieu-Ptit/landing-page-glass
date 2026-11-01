import type { SceneFrame, SceneRange, MotionMode, ViewportMode } from '../lib/contracts';
export const SCENE_RANGES = [
  { id: 'alpine', label: 'The ascent', start: 0, end: 0.2, description: 'Athlete in a snowy alpine environment.' },
  { id: 'equip', label: 'Find your focus', start: 0.2, end: 0.36, description: 'Athlete puts on the AERIS X1 goggles.' },
  { id: 'dissolve', label: 'Nothing else', start: 0.36, end: 0.48, description: 'The alpine environment dissolves to black.' },
  { id: 'approach', label: 'Closer to clarity', start: 0.48, end: 0.66, description: 'The isolated goggles move toward the camera.' },
  { id: 'viewer', label: 'Every angle', start: 0.66, end: 0.86, description: 'An interactive product viewer.' },
  { id: 'commerce', label: 'Make it yours', start: 0.86, end: 1, description: 'The product docks into the commerce panel.' },
] as const satisfies readonly SceneRange[];
export const clamp01 = (value: number) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export function sceneAt(progress: number): SceneRange {
  const p = clamp01(progress);
  return SCENE_RANGES.find(range => p < range.end) ?? SCENE_RANGES[5];
}
export function frameFor(range: SceneRange, progress: number, motion: MotionMode, viewport: ViewportMode): SceneFrame {
  const p = clamp01(progress);
  return { progress: p, localProgress: clamp01((p - range.start) / (range.end - range.start)), active: sceneAt(p).id === range.id, motion, viewport };
}
