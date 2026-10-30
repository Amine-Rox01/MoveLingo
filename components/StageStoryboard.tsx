'use client';
import {useEffect,useRef,useId,useState} from 'react';
import {gsap} from 'gsap';
import {useReducedMotion} from 'framer-motion';
import {BookOpen,Headphones,MessageCircle,Check,PenLine,Lightbulb,Flag,ArrowRight,MapPin,ClipboardCheck,Volleyball,Briefcase,CalendarDays} from 'lucide-react';
import type {Setup,Stage} from '@/lib/lesson';
import {sceneKind} from '@/lib/lesson-visuals';

function Learner({x,y,color='#315d50',gesture=false,mirror=false}:{x:number;y:number;color?:string;gesture?:boolean;mirror?:boolean}){
 return <g transform={`translate(${x} ${y}) scale(${mirror?-1:1} 1)`}><circle cx="0" cy="0" r="17" fill="#b97b53"/><path d="M-17-3Q-18-28 7-20Q22-17 17 0L8-8-5-9Z" fill="#342c28"/><path d="M-18 25Q0 12 18 25L22 75H-22Z" fill={color}/><path d="M-12 76L-20 118M12 76L23 118" fill="none" stroke="#243b48" strokeWidth="13" strokeLinecap="round"/><path d="M-23 122H-9M19 122H32" stroke="#fff" strokeWidth="10" strokeLinecap="round"/><path className={gesture?'story-arm':''} d={gesture?'M-15 31L-38 13L-35-19':'M-15 31L-37 52L-57 41'} fill="none" stroke="#b97b53" strokeWidth="10" strokeLinecap="round"/><path d="M15 31L39 47L58 34" fill="none" stroke="#b97b53" strokeWidth="10" strokeLinecap="round"/></g>;
}
export default function StageStoryboard({stage,setup,step,playing,onReplay}:{stage:Stage;setup?:Setup;step:number;playing:boolean;onReplay?:()=>void}){
 const kind=sceneKind(stage,setup),beat=step%3;
 const root=useRef<HTMLElement>(null),timeline=useRef<gsap.core.Timeline|null>(null);const reduced=useReducedMotion();const lastStep=useRef(step);const playback=useRef({playing,visible:false});const [speed,setSpeed]=useState(1);const gradientId=useId().replace(/:/g,'');
 useEffect(()=>{
  if(!root.current||reduced)return;
  const ctx=gsap.context(()=>{
   const q=gsap.utils.selector(root);const tl=gsap.timeline({paused:true,repeat:-1,repeatDelay:.3,defaults:{ease:'power1.inOut'}});timeline.current=tl;
   const add=(selector:string,from:gsap.TweenVars,to:gsap.TweenVars,at=0)=>{const targets=q(selector);if(targets.length)tl.fromTo(targets,from,to,at);};
   if(kind==='gesture')add('.story-arm',{rotation:0,svgOrigin:'0 30'},{rotation:22,duration:.65,yoyo:true,repeat:3,stagger:.2});
   else if(kind==='chart')add('.story-bar',{scaleY:.02,transformOrigin:'50% 100%'},{scaleY:1,duration:.8,stagger:.4,ease:'power2.out'});
   else if(kind==='route'){add('.story-token',{attr:{cx:240,cy:244}},{attr:{cx:320,cy:204},duration:1},.2);tl.to(q('.story-token'),{attr:{cx:400,cy:244},duration:1},1.6);tl.to(q('.story-token'),{scale:1.2,transformOrigin:'50% 50%',duration:.3,yoyo:true,repeat:1},2.7);}
   else if(kind==='exit')add('.story-pencil',{x:0,y:0},{x:-32,y:28,duration:.65,yoyo:true,repeat:3});
   else if(kind==='design')add('.story-idea',{scale:.8,opacity:.55,transformOrigin:'50% 50%'},{scale:1.08,opacity:1,duration:.8,yoyo:true,repeat:2});
   else if(kind==='report')add('.story-check',{scale:.1,opacity:0,transformOrigin:'50% 50%'},{scale:1,opacity:1,duration:.7,ease:'back.out(1.5)'});
   else if(kind==='read'||kind==='listen')add('.story-sound',{opacity:.2,scale:.9,transformOrigin:'50% 50%'},{opacity:1,scale:1.08,duration:.6,yoyo:true,repeat:3});
   else add('.story-cards',{x:-20},{x:24,duration:1.2,yoyo:true,repeat:1});
   tl.to({},{duration:Math.max(0,3.5-tl.duration())});
  },root);
  const sync=()=>{if(playback.current.playing&&playback.current.visible&&document.visibilityState==='visible')timeline.current?.play();else timeline.current?.pause();};
  const observer=new IntersectionObserver(entries=>{playback.current.visible=entries[0].isIntersecting;sync();},{threshold:.1});observer.observe(root.current!);document.addEventListener('visibilitychange',sync);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);ctx.revert();timeline.current=null;};
 },[kind,stage.title,reduced]);
 useEffect(()=>{playback.current.playing=playing&&!reduced;const tl=timeline.current;if(!tl)return;if(reduced||!playing||!playback.current.visible||document.visibilityState!=='visible')tl.pause();else tl.play();},[playing,reduced,kind,stage.title]);
 useEffect(()=>{timeline.current?.timeScale(speed);},[speed,kind,reduced]);
 useEffect(()=>{const changed=lastStep.current!==step;lastStep.current=step;const tl=timeline.current;if(tl&&changed&&!playing)tl.progress(beat/3).pause();},[step,beat,playing]);

 const unit=Number(setup?.theme.match(/Unit ([1-5]):/)?.[1]||0);
 const TopicIcon=[MapPin,MapPin,Volleyball,CalendarDays,Lightbulb,Briefcase][unit]||BookOpen;
 const focus=stage.motion.labels.slice(0,3);
 const read=kind==='read'||kind==='listen',write=kind==='exit'||kind==='design',route=kind==='route';
 return <figure ref={root} data-animation-engine="gsap" className={`stage-storyboard ${playing?'story-playing':''}`} aria-label={`Illustrated ${kind} guide for ${stage.title}`}>
 <svg viewBox="0 0 640 350" role="img" aria-label={`${stage.title}: ${stage.motion.beats[beat]}`}><defs><linearGradient id={gradientId} x2="0" y2="1"><stop stopColor="#f8f0dc"/><stop offset="1" stopColor="#e0e7db"/></linearGradient></defs><rect width="640" height="350" rx="18" fill={`url(#${gradientId})`}/><rect x="32" y="25" width="576" height="130" rx="8" fill="#fffdf6" stroke="#d5decd"/><path d="M50 300H590" stroke="#becdb8" strokeWidth="2"/><TopicIcon x={290} y={49} width={60} height={60} color="#698068" strokeWidth={1.2}/>
 {kind==='chart'?<><path d="M120 262H520M120 150V262" stroke="#78907e" strokeWidth="3"/>{[5,4,3].map((n,i)=><g key={i} className={`story-bar story-bar-${i}`}><rect x={165+i*120} y={262-n*22} width="65" height={n*22} rx="8" fill={['#315d50','#c78456','#9cae66'][i]}/>{Array.from({length:n},(_,j)=><circle key={j} cx={197+i*120} cy={249-j*22} r="6" fill="#fff9"/>)}<text x={197+i*120} y="290" textAnchor="middle" fill="#29473a" fontSize="18">{['Sports','Art','Reading'][i]}</text></g>)}</>:<><Learner x={155} y={145} gesture={kind==='gesture'} color="#315d50"/><Learner x={485} y={145} gesture={kind==='gesture'} mirror color="#c78456"/>
 {read?<g><rect x="238" y="175" width="164" height="95" rx="12" fill="white" stroke="#9fb397" strokeWidth="2"/>{kind==='listen'?<Headphones x={275} y={183} width={90} height={70} color="#315d50"/>:<BookOpen x={275} y={183} width={90} height={70} color="#315d50"/>}<g className="story-sound"><path d="M210 160Q240 125 270 160M370 160Q400 125 430 160" stroke="#c78456" strokeWidth="4" fill="none"/></g></g>:write?<g><rect x="245" y="160" width="150" height="120" rx="7" fill="white" stroke="#a5b79b" strokeWidth="2"/><path d="M263 188H364M263 211H350M263 234H365M263 257H326" stroke="#b9c6af" strokeWidth="4"/>{kind==='design'?<Lightbulb className="story-idea" x={285} y={170} width={60} height={65} color="#c78456"/>:<PenLine className="story-pencil" x={334} y={193} width={55} height={65} color="#315d50"/>}</g>:route?<g><path d="M230 270Q320 180 410 270" fill="none" stroke="#90a477" strokeWidth="4" strokeDasharray="8 8"/>{[240,320,400].map((x,i)=><g key={x}><ellipse cx={x} cy={275-i%2*40} rx="23" ry="8" fill="#b7c69f"/><path d={`M${x-12} ${270-i%2*40}l12-28 12 28Z`} fill="#d39258"/></g>)}<circle className="story-token" cx={240+beat*80} cy={244-beat%2*40} r="13" fill="#315d50"/><Flag x={393} y={193} width={35} height={40} color="#315d50"/></g>:kind==='report'?<g><ClipboardCheck x={280} y={175} width={80} height={85} color="#315d50"/><Check className="story-check" x={360} y={180} width={60} height={60} color="#7b9b56"/></g>:<g className="story-cards"><rect x="246" y="177" width="60" height="80" rx="9" fill="white" stroke="#315d50" strokeWidth="3"/><rect x="335" y="177" width="60" height="80" rx="9" fill="#f3d8b6" stroke="#c78456" strokeWidth="3"/><MessageCircle x={260} y={196} width={32} height={32} color="#315d50"/><TopicIcon x={349} y={196} width={32} height={32} color="#a66536"/><ArrowRight x={303} y={205} width={34} height={24} color="#78907e"/></g>}
 </>}
 <circle cx="588" cy="52" r="20" fill="#315d50"/><text x="588" y="59" textAnchor="middle" fontSize="19" fill="white">{beat+1}</text></svg>
 <figcaption><span className="eyebrow">{kind==='chart'?'BUILD · COMPARE · CHOOSE':'MODEL · TRY · CHECK'}</span><strong>{stage.motion.beats[beat]}</strong><div className="story-labels">{focus.map((label,i)=><span className={i===beat?'active':''} key={i}>{label}</span>)}</div><div className="story-animation-tools"><label>Motion speed <select aria-label="Illustration speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.65}>Slow</option><option value={1}>Normal</option><option value={1.4}>Quick</option></select></label><button type="button" disabled={!!reduced} onClick={()=>{const tl=timeline.current;if(!tl||reduced)return;tl.restart();onReplay?.();if(!playback.current.visible)tl.pause();}}>Replay illustration</button><small>{reduced?'Reduced motion · static illustration':'Smooth animated demonstration'}</small></div></figcaption>
 </figure>;
}
