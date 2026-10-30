import { parseLesson,type Lesson,type Setup,setupSchema } from './lesson';
const KEY='movelingo.lessons.v8';
export function loadLessons():Lesson[]{try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(a))return [];return a.flatMap(v=>{try{return [parseLesson(v)]}catch{return []}})}catch{return []}}
export function storeLessons(lessons:Lesson[]){localStorage.setItem(KEY,JSON.stringify(lessons));}
export function saveDraft(s:Setup){localStorage.setItem('movelingo.draft.v8',JSON.stringify(s));}
export function loadDraft():Setup|null{try{return setupSchema.parse(JSON.parse(localStorage.getItem('movelingo.draft.v8')||'null'))}catch{return null}}
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
export async function shareURL(lesson:Lesson){
 // Explicitly excludes teacher inputs, access needs, sample and syllabus from the shared payload.
 const shared={...lesson,setup:{...lesson.setup,sample:'',syllabus:'',needs:''},completed:[],reviewed:false};
 const raw=new TextEncoder().encode(JSON.stringify(shared));
 if(raw.length>250000)throw new Error('This lesson is too large for a share link. Download its JSON file instead.');
 const compressed=await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer();
 const base64=btoa(String.fromCharCode(...new Uint8Array(compressed))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
 if(base64.length>24000)throw new Error('This lesson is too large for a reliable share link. Download its JSON file instead.');
 return location.origin+'/?view=lesson#lesson='+base64;
}
export async function readShared(hash:string){
 const b64=hash.slice(8).replaceAll('-','+').replaceAll('_','/');if(b64.length>24000)throw new Error('Shared lesson exceeds the size limit.');
 const bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
 const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
 let total=0;const chunks:Uint8Array[]=[];while(true){const r=await reader.read();if(r.done)break;total+=r.value.length;if(total>250000){await reader.cancel();throw new Error('Shared lesson exceeds the size limit.')}chunks.push(r.value)}
 const data=new Uint8Array(total);let offset=0;for(const c of chunks){data.set(c,offset);offset+=c.length}
 return parseLesson(JSON.parse(new TextDecoder().decode(data)));
}
