'use client';
import type {MovementActivity} from '@/lib/movement';
import paths from '@/lib/activity-images.json';
import {mediaForActivity} from '@/lib/activity-media';
import ActivityMotionPlayer from './ActivityMotionPlayer';
export function activityImage(id:string){return mediaForActivity(id)?.poster||(paths as Record<string,string>)[id]}
export function ActivityArtwork({activity}:{activity:MovementActivity}){return <ActivityMotionPlayer key={activity.id} activity={activity}/>}
