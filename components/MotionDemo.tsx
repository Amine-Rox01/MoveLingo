'use client';
import { useEffect,useState } from 'react';
import { motion,useReducedMotion } from 'framer-motion';
import { Play,Pause,ArrowRight,Headphones,Pencil,Check,MessageCircle } from 'lucide-react';
import type { Stage } from '@/lib/lesson';
export function MotionDemo({stage,compact=false}:{stage:Stage;compact?:boolean}){
 const reduced=useReducedMotion();const [playing,setPlaying]=useState(true);const [beat,setBeat]=useState(0);
 useEffect(()=>{setBeat(0)},[stage]);
 useEffect(()=>{if(!playing||reduced)return;const id=setInterval(()=>setBeat(i=>(i+1)%3),4200);return()=>clearInterval(id)},[playing,reduced]);
 const {labels,beats}=stage.motion;const kind=stage.movement&&stage.approach!=='Reflection'?'move':stage.motion.kind;
 const person=(name:string,i:number)=><div className={'demo-person person-'+i}><span className="person-head"/><span className="person-body"/><span className="person-name">{name}</span></div>;
 return <figure className={`motion-demo ${compact?'compact':''} kind-${kind}`}>
  <div className="demo-top"><span><span className="status-dot"/> Activity in motion</span><button className="icon-btn" onClick={()=>setPlaying(!playing)} aria-label={playing?'Pause demonstration':'Play demonstration'}>{playing&&!reduced?<Pause size={15}/>:<Play size={15}/>}</button></div>
  <div className="demo-scene" aria-hidden="true">
   {kind==='move'?<div className="movement-animation" aria-hidden="true"><span className="move-landmark landmark-one">{labels[0]}</span><svg viewBox="0 0 260 150" className={playing&&!reduced?'moving':''}><path d="M10 130H250" stroke="#8fa991" strokeWidth="2" strokeDasharray="5 6"/><path d="M40 112H211m-14-9 14 9-14 9" fill="none" stroke="#b25132" strokeWidth="3"/><g className="moving-person"><circle cx="72" cy="40" r="13" fill="#c49b76"/><path d="M72 55v32M72 66 50 82M72 66 93 56M72 87 55 112M72 87 92 112" stroke="#315d49" strokeWidth="9" strokeLinecap="round" fill="none"/></g><path d="M200 126 211 93 222 126Z" fill="#d6aa6c" stroke="#886447" strokeWidth="2"/></svg><span className="move-landmark landmark-two">{labels[1]}</span><span className="movement-visual-note">Move safely · seated equivalent available</span></div>:(kind==='pairs'||kind==='circle')?<><div className="people-row">{person(labels[0],0)}<div className="conversation"><motion.div className="speech" key={beat} initial={reduced?false:{opacity:0,y:8}} animate={{opacity:1,y:0}}><MessageCircle size={20}/>{beat===0?'Get ready':beat===1?'Your turn':'Check & switch'}</motion.div><div className="exchange-line"><ArrowRight/></div></div>{person(labels[1],1)}{kind==='circle'&&person(labels[2]||'Observer',2)}</div><div className="mini-result"><Check size={14}/>{labels[2]||'A shared outcome'}</div></>:
   kind==='listen'?<div className="listen-scene"><div className="headphone-disc"><Headphones size={38}/></div><div className={'sound-bars '+(playing&&!reduced?'animate':'')}>{Array.from({length:17},(_,i)=><span key={i} style={{height:(15+(i*17)%43)+'px',animationDelay:i*.09+'s'}}/>)}</div><div className="listen-label">{labels[beat%labels.length]}</div></div>:
   kind==='write'?<div className="writing-sheet"><span className="sheet-label">YOUR RESPONSE</span>{labels.map((s,i)=><motion.div key={s} className="writing-line" animate={{opacity:beat>=i||reduced?1:.3}}><Check size={15}/>{s}</motion.div>)}<Pencil className="sheet-pencil" size={28}/></div>:
   <div className="animated-cards">{labels.map((label,i)=><motion.div className={'visual-card card-'+i} key={i} animate={reduced?{}:{y:beat===i%3?-12:0,rotate:beat===i%3?0:(i-1)*5}} transition={{duration:.6}}><span className="card-marker">{kind==='sequence'?String(i+1).padStart(2,'0'):['A','B','C','D'][i]}</span><strong>{label}</strong><span className="card-line"/></motion.div>)}</div>}
  </div>
  <figcaption><div className="beat-controls" aria-label="Demonstration steps">{beats.map((_,i)=><button key={i} aria-label={`Demonstration step ${i+1}`} aria-pressed={beat===i} className={beat===i?'active':''} onClick={()=>{setBeat(i);setPlaying(false)}}>{i+1}</button>)}</div><p>{beats[beat]}</p></figcaption>
  {!compact&&<span className="demo-note">Schematic rehearsal · {reduced?'motion reduced; use numbered steps':'select a number to pause and inspect'}</span>}
 </figure>
}
