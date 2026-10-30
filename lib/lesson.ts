import { z } from 'zod';

export const skills = ['Vocabulary','Functions','Grammar','Listening','Speaking','Reading','Writing','Pronunciation'] as const;
export const setupSchema = z.object({
  skill: z.enum(skills), topic: z.string().trim().min(2).max(160), theme: z.string().max(160),
  objective: z.string().trim().min(12).max(800), level: z.enum(['Pre-A1','A1','A2','B1','B2','C1']),
  duration: z.number().int().min(20).max(120), classSize: z.number().int().min(1).max(80),
  age: z.enum(['6–9','10–12','13–15','16–18','Adults']), sample: z.string().max(16000),
  needs: z.string().max(1500), space: z.enum(['Classroom','Open space','Indoor hall','Outdoor field','Online']),
  syllabus: z.string().max(16000), movementActivity: z.string().max(80).default(''),
  movementGoal: z.string().max(400).default('Coordination, spatial awareness and cooperative movement'),
  equipmentAvailable: z.string().max(400).default(''),
  layoutNotes:z.string().max(800).optional(), groupingNotes:z.string().max(800).optional(), physicalCriterion:z.string().max(800).optional(),
});
export type Setup = z.infer<typeof setupSchema>;
export const stageSchema = z.object({
  title:z.string().min(2).max(100), phase:z.string().max(50), minutes:z.number().int().min(1).max(60),
  aim:z.string().min(8).max(500), description:z.string().min(15).max(1200),
  interaction:z.enum(['Individual','Pairs','Groups','Whole class']),
  teacherRole:z.array(z.string().max(500)).min(2).max(5), studentRole:z.array(z.string().max(500)).min(2).max(5),
  instructions:z.string().min(15).max(1500), steps:z.array(z.string().max(600)).min(3).max(6),
  materials:z.array(z.object({name:z.string().max(80),content:z.string().max(4000)})).min(1).max(4),
  expectedOutput:z.string().min(10).max(1800), check:z.string().min(10).max(800),
  adaptation:z.string().min(10).max(1000), why:z.string().min(10).max(600),
  sourceQuotes:z.array(z.string().min(1).max(300)).max(6),
  motion:z.object({kind:z.enum(['cards','pairs','sequence','listen','write','circle','move']),
    labels:z.array(z.string().min(1).max(60)).min(2).max(4),
    beats:z.array(z.string().min(8).max(200)).length(3)}),
  teacherTalkPercent:z.number().min(0).max(100),difficulty:z.number().int().min(1).max(5),
  skills:z.array(z.enum(skills)).min(1).max(4),
  approach:z.enum(['TPR','Task-based','Reflection']).default('Reflection'),
  visualActivityId:z.string().max(80).default(''),
  taskScene:z.string().max(80).optional(), visualMode:z.enum(['exact','reference','schematic']).optional(),
  movement:z.string().max(800).default(''), peGoal:z.string().max(400).default(''),
  safety:z.string().max(800).default(''),
});
export const contentSchema=z.object({title:z.string().min(5).max(150),summary:z.string().max(600),
  languageFocus:z.array(z.string().max(180)).min(2).max(12),
  successCriteria:z.array(z.string().max(300)).min(2).max(4),
  stages:z.array(stageSchema).min(4).max(7)});
export type Stage=z.infer<typeof stageSchema>;
export type LessonContent=z.infer<typeof contentSchema>;
export const adaptationEvidenceSchema=z.object({sessionId:z.string().max(100),parentLessonId:z.string().max(100),evidence:z.string().max(2000),actions:z.string().max(3000),domains:z.array(z.enum(['english','participation','teamwork','movement'])).max(4)});
export type Lesson=LessonContent & {id:string;createdAt:string;setup:Setup;origin:'example'|'ai';completed:number[];reviewed:boolean;adaptationEvidence?:z.infer<typeof adaptationEvidenceSchema>};
export const defaultSetup:Setup={skill:'Functions',topic:'Giving directions',theme:'Sport and teamwork',objective:'Students can give and follow simple directions to reach a marked destination and check the result with a partner.',level:'A2',duration:50,classSize:24,age:'13–15',sample:'Go forward. Turn left. Stop at the cone. Is this the right place? Yes, it is.',needs:'Offer a seated option and time to rehearse before speaking.',space:'Classroom',syllabus:'',movementActivity:'robot',movementGoal:'Spatial awareness, coordination and teamwork',equipmentAvailable:'Floor markers or paper cards'};
export const blankSetup:Setup={...defaultSetup,topic:'',theme:'',objective:'',sample:''};

export function validateContent(value:unknown,setup:Setup):LessonContent {
 const result=contentSchema.parse(value);
 const total=result.stages.reduce((n,s)=>n+s.minutes,0);
 if(total!==setup.duration)throw new Error(`The lesson totals ${total} minutes, not ${setup.duration}. Please regenerate.`);
 if(setup.sample.trim())for(const stage of result.stages){
   stage.sourceQuotes=stage.sourceQuotes.map(q=>sourceQuotation(q,setup.sample)??q);
   if(stage.sourceQuotes.some(q=>sourceQuotation(q,setup.sample)===null))
     throw new Error('The lesson contains a source quotation that could not be verified. Please regenerate.');
 }
 if(!result.stages.some(s=>s.skills.includes(setup.skill)))throw new Error('The selected skill is missing from the lesson. Please regenerate.');
 return result;
}
export function newLesson(content:LessonContent,setup:Setup,origin:Lesson['origin']):Lesson{
 return {...content,id:crypto.randomUUID(),createdAt:new Date().toISOString(),setup,origin,completed:[],reviewed:false};
}
export function parseLesson(value:unknown):Lesson{
 const schema=contentSchema.extend({id:z.string().max(100),createdAt:z.string().max(60),setup:setupSchema,origin:z.enum(['example','ai']),completed:z.array(z.number().int().min(0).max(6)),reviewed:z.boolean(),adaptationEvidence:adaptationEvidenceSchema.optional()});
 const data=schema.parse(value);validateContent(data,data.setup);
 if(!Number.isFinite(Date.parse(data.createdAt)))throw new Error('Invalid lesson date.');
 if(data.completed.some(i=>i>=data.stages.length))throw new Error('Invalid stage progress.');
 data.completed=[...new Set(data.completed)];return data;
}
export function lessonMetrics(l:LessonContent){
 const total=l.stages.reduce((a,s)=>a+s.minutes,0);
 const teacher=Math.round(l.stages.reduce((a,s)=>a+s.minutes*s.teacherTalkPercent,0)/total);
 return {total,teacher,student:100-teacher,skills:skills.map(name=>({name,minutes:l.stages.reduce((a,s)=>a+(s.skills.includes(name)?s.minutes:0),0)})).filter(x=>x.minutes>0)};
}

// Match words without treating typographic punctuation as invented language.
// Always return a span copied from the original sample, never the model's rewrite.
export function sourceQuotation(quote:string,sample:string):string|null {
 const tokenise=(text:string)=>Array.from(text.matchAll(/[\p{L}\p{N}]+(?:['’‘][\p{L}\p{N}]+)*/gu),m=>({word:m[0].normalize('NFKC').replace(/[’‘]/g,"'").toLowerCase(),start:m.index!,end:m.index!+m[0].length}));
 const source=tokenise(sample);
 const candidates=[quote,quote.replace(/^\s*(?:customer|server|student|teacher|speaker|learner|source|quote|quotation)\s*:\s*/i,'')];
 for(const candidate of candidates){
  const wanted=tokenise(candidate);if(!wanted.length)continue;
  for(let i=0;i<=source.length-wanted.length;i++)if(wanted.every((w,j)=>w.word===source[i+j].word)){
   const start=source[i].start;let end=source[i+wanted.length-1].end;
   while(end<sample.length&&/[.!?,;:]/.test(sample[end]))end++;
   return sample.slice(start,end);
  }
 }
 return null;
}
export function prepareGeneratedContent(value:unknown,setup:Setup){
 const content=contentSchema.parse(value);let removed=0;
 for(const stage of content.stages){
  stage.sourceQuotes=stage.sourceQuotes.flatMap(q=>{const verified=setup.sample.trim()?sourceQuotation(q,setup.sample):null;if(verified)return [verified];removed++;return []});
 }
 return {content,warnings:removed?['Some AI source quotations could not be verified and were removed. Review the lesson against your teaching sample before using it.']:[]};
}
