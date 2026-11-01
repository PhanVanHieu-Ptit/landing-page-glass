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
