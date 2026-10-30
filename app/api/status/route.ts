import { env } from 'cloudflare:workers';
export async function GET(request:Request){
 const cfg=env as unknown as {GEMINI_API_KEY?:string};
 return Response.json({connected:Boolean(cfg.GEMINI_API_KEY),signedIn:Boolean(request.headers.get('oai-authenticated-user-id'))},{headers:{'Cache-Control':'no-store'}});
}
