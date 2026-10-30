import test from 'node:test';
import assert from 'node:assert/strict';
import {analyseFeedback} from '../lib/feedback-analysis';
test('support counts exclude unobserved learners and remain separate by domain',()=>{
 const data=analyseFeedback([{label:'A',notes:'',ratings:{english:1,movement:3}},{label:'B',notes:'',ratings:{english:2}},{label:'C',notes:''},{label:'D',notes:'',ratings:{english:3}}]);
 const english=data.find(d=>d.id==='english')!;assert.deepEqual(english.counts,[1,1,1]);assert.equal(english.observed,3);assert.equal(english.unobserved,1);assert.equal(english.support,2);
 const movement=data.find(d=>d.id==='movement')!;assert.equal(movement.support,0);assert.equal(movement.observed,1);assert.equal(movement.unobserved,3);
 const teamwork=data.find(d=>d.id==='teamwork')!;assert.equal(teamwork.observed,0);assert.equal(teamwork.support,0);
});
test('empty observations never produce invented scores',()=>{for(const d of analyseFeedback([])){assert.equal(d.observed,0);assert.deepEqual(d.counts,[0,0,0]);}});
