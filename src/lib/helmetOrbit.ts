export const wrapHelmetFrame = (frame: number) => ((frame % 8) + 8) % 8;
export type HelmetOrbit = { heading: number; tilt: number };

/** Both axes advance one photograph per 32px; elevation clamps at the poles. */
export function advanceHelmetOrbit(orbit: HelmetOrbit, dx: number, dy: number): HelmetOrbit {
 if (Math.abs(dy) > Math.abs(dx)) {
  return { heading: orbit.heading, tilt: Math.max(-1, Math.min(1, orbit.tilt + dy / 128)) };
 }
 if (dx === 0) return orbit;
 return { heading: ((orbit.heading - dx / 32) % 8 + 8) % 8, tilt: Math.sign(orbit.tilt) * Math.max(0, Math.abs(orbit.tilt) - Math.abs(dx) / 128) };
}
export function helmetElevationFrame(tilt: number) {
 return Math.round((Math.max(-1, Math.min(1, tilt)) + 1) * 4);
}
