import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {movementActivities} from '../lib/movement';
import {activityMedia} from '../lib/activity-media';

test('every activity has distinct playable media and downloadable GIF',()=>{
 assert.equal(Object.keys(activityMedia).length,movementActivities.length);
 const sheets=new Set<string>();
 for(const activity of movementActivities){
  const media=activityMedia[activity.id];
  assert.ok(media,activity.id);
  assert.equal(media.name,activity.name);
  assert.equal(media.frameCount,6);
  assert.equal(media.columns*media.rows,6);
  assert.ok(media.width>0&&media.height>0);
  assert.ok(!sheets.has(media.sheet));sheets.add(media.sheet);
  for(const path of [media.sheet,media.poster,media.gif,media.animated])assert.ok(existsSync('public'+path),path);
  assert.equal(readFileSync('public'+media.gif).subarray(0,6).toString(),'GIF89a');
 }
});
