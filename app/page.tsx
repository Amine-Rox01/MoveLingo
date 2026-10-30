import Studio from '@/components/Studio';
export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const query=await searchParams;return <Studio initialView={typeof query.view==='string'?query.view:'home'}/>;}
