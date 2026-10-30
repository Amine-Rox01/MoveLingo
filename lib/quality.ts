import type {LessonContent,Setup} from './lesson';
/** Transparent review prompts, not a pedagogical or safety certification. */
export function lessonReview(content:LessonContent,setup:Setup){
 const tasks=content.stages.filter(s=>s.approach==='Task-based');
 const checks=[
  {label:'English goal is explicit',present:setup.objective.trim().length>=12,question:'Can a learner demonstrate this outcome without relying on athletic ability?'},
  {label:'Physical criterion is supplied',present:!!setup.physicalCriterion?.trim(),question:'What controlled movement or cooperation will you actually observe, using the agreed adaptation?'},
  {label:'Usable layout is specified',present:!!setup.layoutNotes?.trim(),question:'Will the active groups and role rotations fit the real space, with a stop signal and an equivalent access option?'},
  {label:'A communicative task is identified',present:tasks.length>0,question:'Is there genuinely missing information, a choice or a problem, and a checkable shared outcome?'},
  {label:'Task materials are separated',present:tasks.every(s=>s.materials.length>=2),question:'Can you distribute the actual private cards without revealing the answer or writing missing content?'},
  {label:'Task-specific visual is assigned',present:tasks.every(s=>!!s.taskScene),question:'Does the visual show the same roles, objects, action order and outcome as this task? A library picture alone does not verify this.'},
 ];
 return checks;
}
