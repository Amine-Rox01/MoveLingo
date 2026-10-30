export const feedbackDomains=[{id:'english',label:'English use',hint:'Uses the target English to communicate.'},{id:'participation',label:'Participation',hint:'Takes an active, meaningful turn.'},{id:'teamwork',label:'Teamwork',hint:'Listens, cooperates and shares roles.'},{id:'movement',label:'Movement skills',hint:'Performs the agreed, accessible movement task.'}] as const;
export type Domain=typeof feedbackDomains[number]['id'];
export type Ratings=Partial<Record<Domain,1|2|3>>;
export type ObservedStudent={id?:string;label:string;notes:string;ratings?:Ratings};
export function analyseFeedback(students:ObservedStudent[]){
 return feedbackDomains.map(domain=>{
  const counts=[0,0,0];let observed=0;
  for(const student of students){const n=student.ratings?.[domain.id];if(n===1||n===2||n===3){counts[n-1]++;observed++}}
  return {...domain,counts,observed,unobserved:students.length-observed,support:counts[0]+counts[1]};
 });
}
