import manifest from './activity-motion.json';
export type ActivityMedia={name:string;number:number;poster:string;sheet:string;gif:string;animated:string;frameCount:number;columns:number;rows:number;width:number;height:number;durationMs:number};
export const activityMedia=manifest as Record<string,ActivityMedia>;
export function mediaForActivity(id:string){return activityMedia[id]}
