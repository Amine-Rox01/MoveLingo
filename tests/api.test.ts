import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {cafeExample} from '../lib/examples';
const physicalExample=structuredClone(cafeExample);
Object.assign(physicalExample.stages[0],{approach:'TPR',movement:'Learners walk slowly to a marked cone.',peGoal:'Spatial awareness',safety:'Keep clear space and stop on a signal.'});
Object.assign(physicalExample.stages[2],{approach:'Task-based',movement:'Pairs guide each other to a hidden destination.',peGoal:'Coordination and teamwork',safety:'Keep clear space; offer a seated equivalent.'});
const dir=new URL('../work/tests/',import.meta.url);await mkdir(dir,{recursive:true});
const target=new URL('route.mjs',dir);
await build({entryPoints:['app/api/generate/route.ts'],bundle:true,platform:'node',format:'esm',outfile:target.pathname.replace(/^\/([A-Z]:)/,'$1'),plugins:[{name:'test-worker-env',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test-env'}));b.onLoad({filter:/.*/,namespace:'test-env'},()=>({contents:'export const env={GEMINI_API_KEY:"TEST_FIXTURE_NOT_A_SECRET"};'}))}}],logLevel:'silent'});
const {POST}=await import(target.href);
const realFetch=globalThis.fetch;
const input=()=>({setup:cafeExample.setup});
const req=(body:unknown,extra:Record<string,string>={})=>new Request('https://example.test/api/generate',{method:'POST',headers:{origin:'https://example.test','content-type':'application/json','oai-authenticated-user-id':crypto.randomUUID(),...extra},body:JSON.stringify(body)});
const output=(value:unknown)=>Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]});
test('generation forwards actual teacher inputs, prompt and strict schema; never uses stored example fallback',async()=>{
 let requestBody:any;
 globalThis.fetch=async(_url,options)=>{requestBody=JSON.parse(String(options?.body));return output(physicalExample)};
 try{const r=await POST(req(input()));assert.equal(r.status,200);assert.equal(requestBody.generationConfig.responseFormat.text.mimeType,'APPLICATION_JSON');assert.deepEqual(JSON.parse(requestBody.contents[0].parts[0].text).setup,cafeExample.setup);assert.match(requestBody.systemInstruction.parts[0].text,/ANY teacher-chosen topic/);}finally{globalThis.fetch=realFetch}
});
test('missing identity and cross-origin requests are rejected before any provider call',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return output(physicalExample)};
 try{assert.equal((await POST(req(input(),{'oai-authenticated-user-id':''}))).status,401);assert.equal((await POST(req(input(),{origin:'https://other.test'}))).status,403);assert.equal(calls,0)}finally{globalThis.fetch=realFetch}
});
test('invalid inputs, provider errors, incomplete answers and invented quotations do not become lessons',async()=>{
 try{assert.equal((await POST(req({setup:{...cafeExample.setup,duration:5}}))).status,400);
 globalThis.fetch=async()=>new Response('',{status:429});assert.equal((await POST(req(input()))).status,502);
 globalThis.fetch=async()=>Response.json({candidates:[{finishReason:'MAX_TOKENS'}]});assert.equal((await POST(req(input()))).status,502);
 const fake=structuredClone(physicalExample);fake.stages[0].sourceQuotes=['Invented quote'];globalThis.fetch=async()=>output(fake);const repaired=await POST(req(input()));assert.equal(repaired.status,200);const checked=await repaired.json() as any;assert.deepEqual(checked.lesson.stages[0].sourceQuotes,[]);assert.ok(checked.warnings.length);
 }finally{globalThis.fetch=realFetch}
});
test('a single-stage revision preserves every unrelated stage',async()=>{
 const changed=structuredClone(physicalExample);changed.stages[1].title='A revised noticing activity';changed.stages[0].title='An unwanted unrelated change';
 globalThis.fetch=async()=>output(changed);
 try{const r=await POST(req({setup:cafeExample.setup,revision:{index:1,action:'Regenerate',lesson:physicalExample}}));assert.equal(r.status,200);const data=await r.json() as any;assert.equal(data.lesson.stages[1].title,changed.stages[1].title);assert.deepEqual(data.lesson.stages[0],physicalExample.stages[0]);}finally{globalThis.fetch=realFetch}
});
test('shortening reallocates time and refuses a response that is not shorter',async()=>{
 try{globalThis.fetch=async()=>output(physicalExample);assert.equal((await POST(req({setup:cafeExample.setup,revision:{index:1,action:'Make shorter',lesson:physicalExample}}))).status,502);
 const changed=structuredClone(physicalExample);changed.stages[1].minutes-=2;changed.stages[5].minutes+=2;globalThis.fetch=async()=>output(changed);const r=await POST(req({setup:cafeExample.setup,revision:{index:1,action:'Make shorter',lesson:physicalExample}}));assert.equal(r.status,200);
 }finally{globalThis.fetch=realFetch}
});

test('selected activity is sent to Gemini and unrelated nonmovement plans are rejected',async()=>{
 let payload:any;globalThis.fetch=async(_url,options)=>{payload=JSON.parse(String(options?.body));return output(physicalExample)};
 try{const setup={...cafeExample.setup,movementActivity:'robot'};const r=await POST(req({setup}));assert.equal(r.status,200);assert.equal(JSON.parse(payload.contents[0].parts[0].text).movementLibrary.selected.name,'Robot and programmer');globalThis.fetch=async()=>output(cafeExample);assert.equal((await POST(req(input()))).status,502)}finally{globalThis.fetch=realFetch}
});
test('AI receives the picture catalog and valid stage image assignments are retained',async()=>{
 let payload:any;const generated=structuredClone(physicalExample);generated.stages[0].visualActivityId='simon';generated.stages[1].visualActivityId='does-not-exist';globalThis.fetch=async(_url,options)=>{payload=JSON.parse(String(options?.body));return output(generated)};
 try{const r=await POST(req(input()));assert.equal(r.status,200);const sent=JSON.parse(payload.contents[0].parts[0].text);assert.equal(sent.visualActivities.length,82);const result=await r.json() as any;assert.equal(result.lesson.stages[0].visualActivityId,'simon');assert.equal(result.lesson.stages[1].visualActivityId,'')}finally{globalThis.fetch=realFetch}
});

 test('failed provider requests do not consume the successful-generation allowance',async()=>{
 const headers={'oai-authenticated-user-id':'failed-generation-regression'};
 try{globalThis.fetch=async()=>{throw new TypeError('fetch failed')};for(let i=0;i<12;i++){const r=await POST(req(input(),headers));assert.equal(r.status,503);assert.match((await r.json() as any).error,/reach Gemini/)}
 globalThis.fetch=async()=>output(physicalExample);assert.equal((await POST(req(input(),headers))).status,200);
 }finally{globalThis.fetch=realFetch}
 });
 test('provider timeouts explain that inputs were preserved',async()=>{
 try{globalThis.fetch=async()=>{throw new DOMException('Timed out','TimeoutError')};const r=await POST(req(input()));assert.equal(r.status,504);assert.match((await r.json() as any).error,/took too long/)}finally{globalThis.fetch=realFetch}
 });
