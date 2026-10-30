import test from 'node:test';
import assert from 'node:assert/strict';
import {newSession,nextLearner,adaptFromObservations,evidenceOnlyFeedback,matchedProgress,comparableSessions,readSessions,SESSION_KEY} from '../lib/classroom';
import {showcaseLessons} from '../lib/showcase';
import {parseLesson} from '../lib/lesson';
test('anonymous IDs and labels stay unique after removal and a full 80-learner roster',()=>{
 const students=[nextLearner([])];students.push(nextLearner(students));students.shift();students.push(nextLearner(students));
 while(students.length<80)students.push(nextLearner(students));
 assert.equal(new Set(students.map(s=>s.id)).size,80);assert.equal(new Set(students.map(s=>s.label)).size,80);
});
test('observation adaptation preserves the original and changes a task’s support materials and rehearsal',()=>{
 const lesson=showcaseLessons[0].lesson,s=newSession(lesson);s.students[0].ratings={english:1,movement:2};
 const before=JSON.stringify(lesson);const adapted=adaptFromObservations(lesson,s,['english','movement']);parseLesson(adapted);
 assert.equal(JSON.stringify(lesson),before);assert.notEqual(adapted.id,lesson.id);assert.equal(adapted.reviewed,false);
 assert.ok(adapted.stages[3].materials.some(m=>m.name==='Observation-based support card'));
 assert.notEqual(adapted.stages[2].steps[0],lesson.stages[2].steps[0]);assert.notEqual(adapted.stages[3].movement,lesson.stages[3].movement);
 assert.ok(adapted.adaptationEvidence?.evidence.includes('1 of 1'));assert.throws(()=>adaptFromObservations(lesson,newSession(lesson),['english']));
});
test('progress comparison includes only matched observed IDs with unchanged class and criteria',()=>{
 const a=newSession(showcaseLessons[0].lesson),b=structuredClone(a);a.students[0].ratings={english:1};b.students[0].ratings={english:3};
 b.students.push({...nextLearner(b.students),ratings:{english:3}});const values=matchedProgress(a,b);assert.equal(values[0].count,1);assert.equal(values[0].improved,1);assert.equal(values[1].count,0);
 b.physicalCriterion='A different movement task';assert.equal(comparableSessions(a,b),false);assert.deepEqual(matchedProgress(a,b),[]);
});
test('saved session parsing safely rejects malformed records and preserves valid stable IDs',()=>{
 const session=newSession();const records=readSessions({getItem:key=>key===SESSION_KEY?JSON.stringify([session,{broken:true}]):null});assert.equal(records.length,1);assert.equal(records[0].students[0].id,session.students[0].id);
});
test('local feedback uses literal evidence and never invents observations for unobserved learners',()=>{
 const s=newSession();s.students[0].notes='Asked for one repetition before placing the correct direction card.';s.students[0].ratings={english:2};s.students.push(nextLearner(s.students));
 const feedback=evidenceOnlyFeedback(s);assert.equal(feedback.students.length,1);assert.equal(feedback.students[0].evidence,s.students[0].notes);assert.equal(feedback.students[0].strength,s.students[0].notes);assert.ok(feedback.classFeedback.strength.includes('1 observed'));
});
