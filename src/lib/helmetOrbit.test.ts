import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceHelmetOrbit, helmetElevationFrame, wrapHelmetFrame } from './helmetOrbit';

test('horizontal and vertical gestures use the same 32px per photograph',()=>{
 const horizontal=advanceHelmetOrbit({heading:4,tilt:0},32,0);
 const vertical=advanceHelmetOrbit({heading:4,tilt:0},0,32);
 assert.equal(horizontal.heading,3);
 assert.equal(helmetElevationFrame(vertical.tilt),5);
});
test('reversal responds immediately after dragging far past a pole',()=>{
 const above=advanceHelmetOrbit({heading:2,tilt:0},0,900);
 const reverse=advanceHelmetOrbit(above,0,-32);
 assert.equal(above.tilt,1);
 assert.equal(reverse.tilt,.75);
 const below=advanceHelmetOrbit({heading:2,tilt:0},0,-900);
 assert.equal(advanceHelmetOrbit(below,0,32).tilt,-.75);
});
test('one drag can change direction without being locked to its first axis',()=>{
 const horizontal=advanceHelmetOrbit({heading:4,tilt:0},32,0);
 const vertical=advanceHelmetOrbit(horizontal,0,64);
 assert.equal(vertical.heading,3);
 assert.equal(vertical.tilt,.5);
 assert.equal(advanceHelmetOrbit(vertical,-32,0).heading,4);
});
test('small input increments accumulate without losing motion',()=>{
 let orbit={heading:4,tilt:0};
 for(let i=0;i<32;i++)orbit=advanceHelmetOrbit(orbit,0,1);
 assert.equal(orbit.tilt,.25);
 assert.equal(helmetElevationFrame(orbit.tilt),5);
});
test('horizontal orbit wraps and elevation endpoints stay valid',()=>{
 assert.equal(wrapHelmetFrame(-1),7);
 assert.equal(wrapHelmetFrame(8),0);
 assert.equal(helmetElevationFrame(-2),0);
 assert.equal(helmetElevationFrame(2),8);
});
