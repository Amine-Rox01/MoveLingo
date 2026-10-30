import test from 'node:test';
import assert from 'node:assert/strict';
import {unzipSync,strFromU8} from 'fflate';
import {cafeExample} from '../lib/examples';
import {exportWord} from '../lib/export';
import {extractText} from '../lib/files';

test('Word export contains the actual stages, instructions and answer keys',async()=>{
 let blob:Blob|undefined;let filename='';
 const originalDocument=globalThis.document,originalCreate=URL.createObjectURL,originalRevoke=URL.revokeObjectURL;
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement:()=>({set href(_v:string){},set download(v:string){filename=v},click(){}})}});
 URL.createObjectURL=(b:Blob|MediaSource)=>{blob=b as Blob;return 'blob:test'};URL.revokeObjectURL=()=>{};
 try{
  await exportWord(cafeExample);assert.ok(blob);assert.match(filename,/\.docx$/);
  const zip=unzipSync(new Uint8Array(await blob!.arrayBuffer()));const xml=strFromU8(zip['word/document.xml']);
  assert.match(xml,/One menu, two choices/);assert.match(xml,/The missing-price menu/);assert.match(xml,/Quick check/);assert.match(xml,/Answer key/);assert.match(xml,/twelve dirhams/);
 }finally{Object.defineProperty(globalThis,'document',{configurable:true,value:originalDocument});URL.createObjectURL=originalCreate;URL.revokeObjectURL=originalRevoke}
});
test('plain-text import returns the actual material and rejects missing/unsupported material',async()=>{
 assert.equal(await extractText(new File(['A short teaching sample.'],'sample.txt')),'A short teaching sample.');
 await assert.rejects(()=>extractText(new File([''],'empty.txt')),/No readable text/);
 await assert.rejects(()=>extractText(new File(['x'],'sample.rtf')),/TXT, PDF or DOCX/);
});
