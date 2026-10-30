/** Retry transient provider outages within one shared deadline, never invalid keys or quota. */
export async function requestGemini(url:string,init:RequestInit,options:{signal?:AbortSignal;pause?:(ms:number)=>Promise<void>}={}){
 const signal=options.signal??AbortSignal.timeout(110000);
 const pause=options.pause??(ms=>new Promise<void>((resolve,reject)=>{
  if(signal.aborted){reject(signal.reason);return;}
  const onAbort=()=>{clearTimeout(timer);reject(signal.reason)};
  const timer=setTimeout(()=>{signal.removeEventListener('abort',onAbort);resolve()},ms);
  signal.addEventListener('abort',onAbort,{once:true});
 }));
 for(let attempt=0;;attempt++){
  const result=await fetch(url,{...init,signal});
  if(![500,502,503,504].includes(result.status)||attempt>=2)return result;
  await result.body?.cancel();
  await pause(1000*2**attempt+Math.floor(Math.random()*250));
 }
}
