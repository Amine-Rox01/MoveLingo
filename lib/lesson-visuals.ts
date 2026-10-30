import type {Setup,Stage} from './lesson';

export const unitPhotos=['summer','clubs','celebrate','inventions','future'].map(name=>`/images/spotlight/${name}.webp`);
export function lessonPhoto(setup?:Setup){
 const match=setup?.theme.match(/Spotlight 3 · Unit ([1-5]):/);
 if(match)return {src:unitPhotos[Number(match[1])-1],alt:`AI-created school scene for ${setup!.theme.split(': ').slice(1).join(': ')}`,generated:true};
 return {src:setup?.skill==='Reading'?'/images/community.jpg':setup?.skill==='Listening'||setup?.skill==='Writing'?'/images/learning.jpg':'/images/classroom.jpg',alt:'Classroom context photograph',generated:false};
}
export function sceneKind(stage:Stage,setup?:Setup){
 if(stage.approach==='TPR')return 'gesture';
 if(setup?.sample.includes('fictional survey of 12 learners')&&/survey|bar chart/i.test(stage.title+' '+stage.description))return 'chart';
 if(/invention|prototype/i.test(stage.title+' '+stage.description)&&stage.approach==='Task-based')return 'design';
 if(/exit|assessment|reflection/i.test(stage.phase))return 'exit';
 if(/report|repair/i.test(stage.phase))return 'report';
 if(/model|notice|presentation/i.test(stage.phase))return setup?.skill==='Listening'?'listen':'read';
 if(stage.approach==='Task-based')return 'route';
 return stage.motion.kind==='write'?'exit':stage.motion.kind==='listen'?'listen':'exchange';
}
