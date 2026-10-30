import test from 'node:test';
import assert from 'node:assert/strict';
import {setupSchema,validateContent,parseLesson,lessonMetrics,skills} from '../lib/lesson';
import {cafeExample,starters} from '../lib/examples';
import {shareURL,readShared} from '../lib/storage';

test('authored example is valid, grounded and totals exactly 50 minutes',()=>{
 const l=parseLesson(cafeExample);assert.equal(lessonMetrics(l).total,50);
 assert.equal(l.stages.length,6);assert.equal(l.stages.reduce((n,s)=>n+s.materials.length,0),9);
});
test('all provided starter settings are valid and have distinct objectives and samples',()=>{
 for(const s of starters)setupSchema.parse(s.setup);
 assert.equal(new Set(starters.map(s=>s.setup.objective)).size,starters.length);
 assert.equal(new Set(starters.map(s=>s.setup.sample)).size,starters.length);
});
test('all 8 skills accept an arbitrary topic with no source material',()=>{
 for(const skill of skills)assert.equal(setupSchema.parse({...cafeExample.setup,skill,topic:'Designing a garden on Mars',objective:'Learners can compare two imaginary garden designs and justify a choice.',sample:'',syllabus:''}).skill,skill);
});
test('incorrect timing, missing skill and fabricated source quotations are rejected',()=>{
 const timing=structuredClone(cafeExample);timing.stages[0].minutes++;assert.throws(()=>validateContent(timing,timing.setup),/totals/);
 const wrong=structuredClone(cafeExample);wrong.stages[1].sourceQuotes=['A completely invented source quotation.'];assert.throws(()=>validateContent(wrong,wrong.setup),/source quotation/);
 const missing=structuredClone(cafeExample);missing.stages[0].sourceQuotes=[];assert.doesNotThrow(()=>validateContent(missing,missing.setup));
 assert.throws(()=>validateContent(cafeExample,{...cafeExample.setup,skill:'Pronunciation'}),/skill/);
});
test('a non-source speaker label may be removed only when the remaining quotation is exact',()=>{
 const l=structuredClone(cafeExample);l.stages[0].sourceQuotes=['Customer: How much is it?'];
 assert.deepEqual(validateContent(l,l.setup).stages[0].sourceQuotes,['How much is it?']);
 l.stages[0].sourceQuotes=['Customer: invented words'];assert.throws(()=>validateContent(l,l.setup),/source quotation/);
});
test('schematic demonstration requires three beats; malformed imports are rejected',()=>{
 const x=structuredClone(cafeExample);x.stages[0].motion.beats.pop();assert.throws(()=>parseLesson(x));
 assert.throws(()=>parseLesson({...cafeExample,completed:[6]}));assert.throws(()=>parseLesson({...cafeExample,createdAt:'nonsense'}));
 assert.deepEqual(parseLesson({...cafeExample,completed:[1,1]}).completed,[1]);
});
test('talk-time estimates are duration-weighted; skill coverage is not summed as unique time',()=>{
 const m=lessonMetrics(cafeExample);assert.equal(m.teacher,27);assert.equal(m.student,73);assert.equal(m.skills[0].minutes,50);
});
test('share links round-trip while excluding original sample, syllabus and access needs',async()=>{
 Object.defineProperty(globalThis,'location',{value:{origin:'https://example.test'},configurable:true});
 const url=await shareURL({...cafeExample,setup:{...cafeExample.setup,syllabus:'PRIVATE SYLLABUS INPUT',needs:'PRIVATE ACCESS INPUT'}});
 const restored=await readShared(new URL(url).hash);assert.equal(restored.title,cafeExample.title);assert.equal(restored.setup.sample,'');assert.equal(restored.setup.syllabus,'');assert.equal(restored.setup.needs,'');assert.deepEqual(restored.completed,[]);
});
test('corrupt and oversized share payloads fail safely',async()=>{
 await assert.rejects(()=>readShared('#lesson=invalid'));await assert.rejects(()=>readShared('#lesson='+'a'.repeat(25000)),/size limit/);
});

test('source formatting is recovered from original text without accepting changed words',()=>{
 const l=structuredClone(cafeExample);l.stages[0].sourceQuotes=['“How much is it?”','Source: Small or large'];
 assert.deepEqual(validateContent(l,l.setup).stages[0].sourceQuotes,['How much is it?','Small or large?']);
 l.stages[0].sourceQuotes=['How expensive is it?'];assert.throws(()=>validateContent(l,l.setup),/source quotation/);
});
