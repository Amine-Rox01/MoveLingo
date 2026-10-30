import test from 'node:test';
import assert from 'node:assert/strict';
import {moroccoThemes,moroccoUnits,freshThemeLesson} from '../lib/morocco-themes';
import {parseLesson} from '../lib/lesson';
import {validateMovementPlan} from '../lib/movement';
import media from '../lib/activity-motion.json';

test('twenty original ready lessons cover all five units and satisfy teaching and movement schemas',()=>{
 assert.equal(moroccoThemes.length,20);assert.equal(moroccoUnits.length,5);
 for(let unit=1;unit<=5;unit++)assert.equal(moroccoThemes.filter(t=>t.unit===unit).length,4);
 for(const theme of moroccoThemes){
  const l=parseLesson(theme.lesson);validateMovementPlan(l);
  assert.equal(l.stages.length,6);assert.equal(l.stages.reduce((n,s)=>n+s.minutes,0),50);
  assert.equal(l.stages[3].description,theme.task);assert.ok(l.stages[3].instructions.includes(theme.language));
  assert.ok(l.stages[1].materials.some(m=>m.content.includes(theme.model)));
  assert.ok(l.stages[1].materials.some(m=>m.content.includes(theme.key)));
  if(theme.visual)assert.ok(theme.visual in media,`Missing visual ${theme.visual}`);
 }
 assert.equal(new Set(moroccoThemes.map(t=>t.lesson.setup.objective)).size,20);
 assert.equal(new Set(moroccoThemes.map(t=>t.task)).size,20);
});
test('opening ready lessons creates independent editable copies without an API request',()=>{
 const a=freshThemeLesson('ma3-01'),b=freshThemeLesson('ma3-01');
 assert.notEqual(a.id,b.id);a.completed.push(0);a.stages[0].title='Changed';
 assert.deepEqual(b.completed,[]);assert.notEqual(b.stages[0].title,'Changed');
 assert.equal(moroccoThemes[0].lesson.stages[0].title,'Listen, gesture, connect');
 assert.throws(()=>freshThemeLesson('missing'));
});
