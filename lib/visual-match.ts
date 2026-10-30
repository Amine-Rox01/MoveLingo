import {movementActivities} from './movement';
import type {Stage} from './lesson';
function norm(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
export function matchStageActivity(stage:Stage,selectedId:string){
 if(stage.visualActivityId&&movementActivities.some(a=>a.id===stage.visualActivityId))return stage.visualActivityId;
 const text=norm(stage.title+' '+stage.description);
 const exact=movementActivities.find(a=>{const name=norm(a.name);return name.length>5&&text.includes(name)});if(exact)return exact.id;
 const aliases: Array<[string,RegExp]>=[['simon',/\bsimon says\b/],['traffic',/\btraffic lights?\b/],['rundict',/\brunning dictation\b/],['sentrelay',/\bsentence builder relay\b/],['treasure',/\btreasure hunt\b/],['grid',/\bfloor grid routes?\b/],['mime',/\bmime and guess\b/],['boardgame',/\bmove and speak board game\b/],['robot',/\brobot and programmer\b/],['storyboard',/\bhuman storyboard\b/],['tableau',/\bfrozen picture\b/],['mirror',/\bmirror and command\b/]];
 const alias=aliases.find(([,pattern])=>pattern.test(text));if(alias)return alias[0];
 // These library sequences illustrate the movement mechanics of the authored
 // showcase tasks; they are reference demonstrations, not the role cards.
 const showcase:Record<string,string>={'sports-route':'robot','summer-story':'storyboard',
  'ma3-01':'storyboard','ma3-03':'mime','ma3-04':'tableau',
  'ma3-06':'interview','ma3-07':'fairroles','ma3-08':'budgetkit',
  'ma3-13':'actiondetective','ma3-14':'interview','ma3-15':'tableau',
  'ma3-17':'coachinterview','ma3-18':'routechoice'};
 if(stage.taskScene&&showcase[stage.taskScene])return showcase[stage.taskScene];
 const selected=movementActivities.find(a=>a.id===selectedId);
 if(selected){const title=norm(selected.name);if(text.includes(title))return selected.id;if(selected.id==='robot'&&text.includes('robot')&&text.includes('programmer'))return selected.id}
 return '';
}
