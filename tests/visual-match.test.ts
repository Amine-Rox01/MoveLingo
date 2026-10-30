import test from 'node:test';
import assert from 'node:assert/strict';
import {movementExample} from '../lib/examples';
import {matchStageActivity} from '../lib/visual-match';
import {movementActivities,selectedMovement} from '../lib/movement';
import {defaultSetup} from '../lib/lesson';
import {visualReview} from '../lib/visual-review';
import paths from '../lib/activity-images.json';
import {existsSync} from 'node:fs';
import {moroccoThemes} from '../lib/morocco-themes';
test('all activities have their own existing image and stage matching respects manual choice',()=>{
 const files=Object.values(paths);assert.equal(files.length,movementActivities.length);assert.equal(new Set(files).size,files.length);for(const p of files)assert.ok(existsSync('public'+p));
 const task=movementExample.stages[3];assert.equal(matchStageActivity(task,'robot'),'robot');assert.equal(matchStageActivity({...task,visualActivityId:'traffic'},'robot'),'traffic');
 assert.equal(matchStageActivity({...task,title:'A completely different lesson',description:'A teacher reads a short poem to the class.',visualActivityId:''},''),'');
});
test('planner prefers reviewed movement examples while retaining teacher choice',()=>{
 const choices=selectedMovement({...defaultSetup,movementActivity:''});
 assert.deepEqual(choices.examples.map(a=>a.id),['simon','robot']);
 assert.ok(visualReview('simon'));assert.ok(visualReview('robot'));
 assert.equal(selectedMovement({...defaultSetup,movementActivity:'mirror'}).selected?.id,'mirror');
 assert.equal(visualReview('mirror'),undefined);
});
test('original supplied illustrations are available for every activity and curated references resolve',()=>{
 for(const activity of movementActivities)assert.ok(existsSync(`public/images/activity-originals/${activity.id}.png`),activity.id);
 const budget=moroccoThemes.find(t=>t.id==='ma3-08')!.lesson.stages[3];
 assert.equal(matchStageActivity(budget,''),'budgetkit');
 assert.equal(matchStageActivity({...budget,visualActivityId:'dice'},''),'dice');
});
