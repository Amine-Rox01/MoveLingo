import test from 'node:test';
import assert from 'node:assert/strict';
import {requestGemini} from '../lib/gemini-request';
const originalFetch=globalThis.fetch;
test('transient Gemini outages retry with backoff and one shared deadline',async()=>{
 const pauses:number[]=[],signals:unknown[]=[];let calls=0;
 try{globalThis.fetch=async(_url,init)=>{signals.push(init?.signal);return new Response('',{status:++calls<3?503:200})};
 const r=await requestGemini('https://provider.test',{}, {pause:async n=>{pauses.push(n)}});
 assert.equal(r.status,200);assert.equal(calls,3);assert.equal(pauses.length,2);
 assert.ok(pauses[0]>=1000&&pauses[0]<1250);assert.ok(pauses[1]>=2000&&pauses[1]<2250);
 assert.ok(signals.every(s=>s===signals[0]));
 }finally{globalThis.fetch=originalFetch}
});
test('persistent outages stop and key or quota failures are not retried',async()=>{
 try{for(const status of [400,401,403,429,503]){let calls=0;globalThis.fetch=async()=>{calls++;return new Response('',{status})};
 assert.equal((await requestGemini('https://provider.test',{}, {pause:async()=>{}})).status,status);
 assert.equal(calls,status===503?3:1);
 }}finally{globalThis.fetch=originalFetch}
});
