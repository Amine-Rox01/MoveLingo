import catalog from './movement-catalog.json';
import type {Setup,LessonContent} from './lesson';
import {reviewedVisuals} from './visual-review';
export const movementActivities=catalog;
export type MovementActivity=typeof catalog[number];
export function movementCandidates(s:Setup){
 const space=s.space==='Classroom'?'Classroom':s.space==='Indoor hall'?'Indoor hall':s.space==='Outdoor field'||s.space==='Open space'?'Outdoor field':null;
 if(!space)return movementActivities.filter(a=>a.noRunning&&a.levels.includes(s.level==='C1'?'B2':s.level)&&!/blindfold/i.test([a.name,a.description,...a.steps].join(' ')));
 const level=s.level==='C1'?'B2':s.level;
 return movementActivities.filter(a=>a.spaces.includes(space)&&a.levels.includes(level)&&
  !(space==='Classroom'&&!a.noRunning&&/\b(run|running|sprint|race)\b/i.test([a.name,a.description,...a.steps].join(' ')))&&
  !/\b(blindfold|blindfolded|eyes closed)\b/i.test([a.name,a.description,...a.steps].join(' ')));
}
export function selectedMovement(s:Setup){
 const eligible=movementCandidates(s);const selected=s.movementActivity&&movementActivities.find(a=>a.id===s.movementActivity);
 if(s.movementActivity&&(!selected||!eligible.some(a=>a.id===s.movementActivity)))throw new Error('The selected movement activity does not match your space or English level. Choose another activity or change the settings.');
 if(!eligible.length)throw new Error('No library activity matches this space and level. Choose another space or English level.');
 const task=eligible.find(a=>!a.warm&&a.taskType==='task'&&reviewedVisuals[a.id])||eligible.find(a=>!a.warm&&a.taskType==='task');const warm=eligible.find(a=>a.warm&&reviewedVisuals[a.id])||eligible.find(a=>a.warm);
 const brief=(a:MovementActivity)=>({id:a.id,name:a.name,aim:a.aim,description:a.description,steps:a.steps,taskType:a.taskType,outcome:a.outcome,adaptations:a.adaptations});
 return {selected:selected?brief(selected):null,examples:[warm,task].filter(Boolean).map(a=>brief(a!))};
}
export function validateMovementPlan(plan:LessonContent){
 const moving=plan.stages.filter(s=>s.movement.trim().length>=15&&s.peGoal.trim().length>=8&&s.safety.trim().length>=10);
 if(moving.length<2||!moving.some(s=>s.approach==='TPR')||!moving.some(s=>s.approach==='Task-based'))throw new Error('The lesson needs a physical TPR activity and a physical communicative task with movement, PE goals and safety guidance. Please regenerate.');
}
