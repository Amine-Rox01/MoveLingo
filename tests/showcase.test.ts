import test from 'node:test';
import assert from 'node:assert/strict';
import {showcaseLessons} from '../lib/showcase';
import {parseLesson} from '../lib/lesson';
import {validateMovementPlan,selectedMovement} from '../lib/movement';
import {taskScenes} from '../lib/task-scenes';
import {offlinePack} from '../lib/offline-pack';
import {moroccoThemes} from '../lib/morocco-themes';
test('three showcase packs have valid timings, complete private cards and distinct physical criteria',()=>{
 assert.equal(showcaseLessons.length,3);for(const {lesson} of showcaseLessons){parseLesson(lesson);validateMovementPlan(lesson);assert.equal(lesson.stages.reduce((n,s)=>n+s.minutes,0),50);assert.ok(lesson.setup.layoutNotes);assert.ok(lesson.setup.physicalCriterion);assert.equal(lesson.stages[3].materials.length,3);assert.ok(taskScenes[lesson.stages[3].taskScene!]);for(const s of lesson.stages)assert.ok(s.steps.every(step=>/^\d+–\d+ min/.test(step)));}
 assert.equal(new Set(showcaseLessons.map(s=>s.lesson.setup.physicalCriterion)).size,3);
});
test('all twenty adaptations use their own role cards, outcome-specific schematic and physical criterion',()=>{
 for(const t of moroccoThemes){parseLesson(t.lesson);const task=t.lesson.stages[3];assert.equal(task.taskScene,t.id);assert.ok(taskScenes[t.id]);assert.equal(task.visualActivityId,'');assert.ok(task.materials.some(m=>m.name==='Private role card A'));assert.ok(task.materials.some(m=>m.name==='Private role card B'));}
 assert.equal(new Set(moroccoThemes.map(t=>t.lesson.setup.physicalCriterion)).size,20);
});
test('offline packs contain the actual cards and scripts, escape HTML and need no external scripts',()=>{
 const lesson=structuredClone(showcaseLessons[0].lesson);lesson.title='<script>alert(1)</script>';const html=offlinePack(lesson);
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('Private guide card A'));assert.ok(html.includes('AUTHORED OFFLINE'));assert.ok(!/<script\s+src=|<link\s/i.test(html));assert.ok(html.includes('TRIANGLE'));assert.ok(html.includes('Print teacher pack'));
});
test('Online has safe no-running candidates instead of an unusable generation path',()=>{
 const setup={...showcaseLessons[0].lesson.setup,space:'Online' as const,movementActivity:''};assert.ok(selectedMovement(setup).examples.length);
});
