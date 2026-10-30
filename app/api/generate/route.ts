import { env } from 'cloudflare:workers';
import { setupSchema,validateContent,contentSchema,prepareGeneratedContent } from '@/lib/lesson';
import { SYSTEM_PROMPT,LESSON_JSON_SCHEMA } from '@/lib/prompt';
import {selectedMovement,validateMovementPlan,movementActivities} from '@/lib/movement';
import { z } from 'zod';
import {requestGemini} from '@/lib/gemini-request';
const requests=new Map<string,{count:number;at:number}>();
const bodySchema=z.object({setup:setupSchema,revision:z.object({index:z.number().int().min(0).max(6),action:z.enum(['Regenerate','Make easier','Make harder','Make shorter','Swap activity']),lesson:contentSchema}).optional()});
const fail=(error:string,status=400)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin)return fail('Open the planner in this website before generating.',403);
 // Production is private and Sites supplies verified identity. Local dev requires Sites local sign-in.
 const user=request.headers.get('oai-authenticated-user-id');
 if(!user)return fail('Please sign in to generate a lesson.',401);
 const cfg=env as unknown as {GEMINI_API_KEY?:string};
 if(!cfg.GEMINI_API_KEY)return fail('Gemini is not connected yet. Add a free-tier GEMINI_API_KEY on the server. Example lessons remain available.',503);
 const now=Date.now(); for(const [k,v] of requests)if(now-v.at>600000)requests.delete(k);
 const bucket=requests.get(user)||{count:0,at:now};
 if(bucket.count>=10)return fail('Please wait a few minutes before generating again.',429);
 if(Number(request.headers.get('content-length')||0)>180000)return fail('This request is too large.',413);
 let body:z.infer<typeof bodySchema>;
 try{const text=await request.text();if(text.length>180000)return fail('This request is too large.',413);body=bodySchema.parse(JSON.parse(text));}catch{return fail('Check the lesson settings and sample. Use 20–120 minutes, 1–80 learners, and a clear objective.');}
 if(body.revision && body.revision.index>=body.revision.lesson.stages.length)return fail('That lesson stage no longer exists.');
 let movementContext:ReturnType<typeof selectedMovement>;
 try{movementContext=selectedMovement(body.setup)}catch(e){return fail(e instanceof Error?e.message:'Choose a suitable movement activity.');}
 bucket.count++;requests.set(user,bucket);
 let succeeded=false;
 try{
  // Fixed to a model with a documented free tier; do not silently switch to paid models.
  const response=await requestGemini('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent',{method:'POST',headers:{'x-goog-api-key':cfg.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM_PROMPT}]},contents:[{role:'user',parts:[{text:JSON.stringify({...body,movementLibrary:movementContext,visualActivities:movementActivities.map(a=>({id:a.id,name:a.name,description:a.description,steps:a.steps}))})}]}],generationConfig:{maxOutputTokens:14000,responseFormat:{text:{mimeType:'APPLICATION_JSON',schema:LESSON_JSON_SCHEMA}}}})});
  if(!response.ok)return fail(response.status===401||response.status===403?'Gemini could not use this key or project. Check free-tier eligibility and the key.':response.status===429?'Gemini’s free usage limit was reached. Please try again later.':response.status===503?'Gemini is temporarily busy. Automatic retries did not succeed. This is a service availability problem, not proof that your key or free quota has ended. Your inputs are preserved; try again shortly.':`Gemini could not complete this lesson (HTTP ${response.status}). Your inputs are preserved. Please try again.`,502);
  const data=await response.json() as {candidates?:{finishReason?:string;content?:{parts?:{text?:string;thought?:boolean}[]}}[]};
  if(data.candidates?.[0]?.finishReason!=='STOP')return fail('The AI response was incomplete. Try a shorter sample or regenerate.',502);
  const text=data.candidates[0].content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('');
  if(!text)return fail('The AI did not return a lesson for these inputs. Please revise the material.',422);
  const prepared=prepareGeneratedContent(JSON.parse(text),body.setup);
  const lesson=validateContent(prepared.content,body.setup);
  if(body.revision){
    const {lesson:old,index,action}=body.revision;
    if(lesson.stages.length!==old.stages.length)return fail('The revision changed the lesson structure. Please retry.',502);
    const other= index===old.stages.length-1?index-1:old.stages.length-1;
    for(let i=0;i<old.stages.length;i++)if(i!==index && !(action==='Make shorter'&&i===other))lesson.stages[i]=old.stages[i];
    validateContent(lesson,body.setup);
    if(action==='Make shorter' && lesson.stages[index].minutes>=old.stages[index].minutes)return fail('The revised stage was not shorter. Please retry.',502);
  }
  for(const stage of lesson.stages)if(stage.visualActivityId&&!movementActivities.some(a=>a.id===stage.visualActivityId))stage.visualActivityId='';
  validateMovementPlan(lesson);
  if(!body.revision&&lesson.stages.some(s=>s.approach!=='Reflection'&&!s.visualActivityId))prepared.warnings.push('Some movement stages have no matching library animation. Choose one in the procedure only if its actions fit, or regenerate.');
  succeeded=true;
  return Response.json({lesson,warnings:prepared.warnings},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  if(error instanceof z.ZodError){const fields=[...new Set(error.issues.map(i=>i.path.join('.')))].slice(0,3).join(', ');return fail(`Gemini returned an invalid lesson field (${fields}). Please regenerate; your inputs are preserved.`,502);}
  if(error instanceof Error && (error.name==='TimeoutError'||error.name==='AbortError'))return fail('Gemini took too long to respond. Try again with a shorter sample; your inputs are preserved.',504);
  if(error instanceof TypeError && /fetch failed|network/i.test(error.message))return fail('The server could not reach Gemini. Check the server internet connection and network permissions; your inputs are preserved.',503);
  return fail(error instanceof Error&&/source quotation|totals|selected skill|physical TPR/.test(error.message)?error.message:'The lesson could not be validated. Please try again; your inputs are preserved.',502);
 }finally{if(!succeeded)bucket.count=Math.max(0,bucket.count-1);}
}
