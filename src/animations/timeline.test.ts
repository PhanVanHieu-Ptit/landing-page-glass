import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENE_RANGES, frameFor, sceneAt } from './timeline';
test('ranges cover the narrative without gaps or overlaps', () => {
  assert.equal(SCENE_RANGES[0].start, 0);
  assert.equal(SCENE_RANGES.at(-1)?.end, 1);
  SCENE_RANGES.forEach((range, i) => { assert.ok(range.end > range.start); if (i) assert.equal(range.start, SCENE_RANGES[i - 1].end); });
});
test('boundaries select exactly one scene and local progress clamps', () => {
  for (const range of SCENE_RANGES) {
    assert.equal(sceneAt(range.start).id, range.id);
    assert.equal(frameFor(range, -1, 'reduced', 'mobile').localProgress, 0);
    assert.equal(frameFor(range, 2, 'full', 'desktop').localProgress, 1);
  }
  assert.equal(sceneAt(1).id, 'commerce');
  assert.equal(sceneAt(NaN).id, 'alpine');
});

import { CINEMATIC_INTERVALS, cinematicFrame } from './masterTimeline';
test('integrated scenes select exact boundaries in both scroll directions', () => {
  for (const scene of [...CINEMATIC_INTERVALS, ...[...CINEMATIC_INTERVALS].reverse()]) {
    assert.equal(cinematicFrame(scene.start).scene.id, scene.id);
    assert.equal(cinematicFrame(scene.start).local, 0);
  }
  assert.equal(cinematicFrame(1).scene.id, 'purchase');
  assert.equal(cinematicFrame(1).local, 1);
  assert.equal(cinematicFrame(-1).progress, 0);
  assert.equal(cinematicFrame(Infinity).progress, 0);
  assert.equal(cinematicFrame(2).progress, 1);
});

test('large jumps and reverse seeks produce history-independent scene frames', () => {
  const positions = [0, .9, .31, 1, .73, .49, .12, .85, .5, .72, 0];
  const expected = positions.map(p => cinematicFrame(p));
  for (let pass = 0; pass < 3; pass++) {
    for (const [index, p] of positions.entries()) {
      assert.deepEqual(cinematicFrame(p), expected[index]);
    }
  }
});
