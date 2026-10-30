'use client';
import {useEffect,type RefObject} from 'react';
import {gsap} from 'gsap';

/** Progressive enhancement: content stays visible if animation cannot run. */
export default function SiteMotion({scope,view,menu}:{scope:RefObject<HTMLDivElement|null>;view:string;menu:boolean}){
 useEffect(()=>{
  const root=scope.current;if(!root)return;
  const media=gsap.matchMedia();let dispose=()=>{};
  media.add('(prefers-reduced-motion: no-preference)',()=>{
   const seen=new WeakSet<Element>();const hover=window.matchMedia('(hover: hover)').matches;
   const selectors='.hero-copy,.hero-visual,.workspace-heading,.lesson-heading,.section-head,.how-card,.theme-card,.form-card,.chart-card,.feedback-chart-card,.activity-card,.saved-card,.stage-header,.activity-motion-player,.lesson-context-photo,.movement-plan,.role-card,.instruction-script,.materials-list,.quick-check,.answer-block,.main-nav.open a,.error-banner,.toast';
   const context=gsap.context(()=>{},root);
   const run=(fn:()=>void)=>context.add(fn);
   const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);run(()=>{gsap.fromTo(entry.target,{opacity:.65,y:22},{opacity:1,y:0,duration:.55,ease:'power2.out',clearProps:'opacity,transform'});});}},{threshold:.08});
   const scan=()=>root.querySelectorAll(selectors).forEach(el=>{if(!seen.has(el)){seen.add(el);observer.observe(el);}});
   scan();let frame=0;
   const mutations=new MutationObserver(records=>{if(records.some(r=>Array.from(r.addedNodes).some(n=>n.nodeType===1))){cancelAnimationFrame(frame);frame=requestAnimationFrame(scan);}});
   mutations.observe(root,{childList:true,subtree:true});
   const over=(e:Event)=>{if(!hover)return;const card=(e.target as Element).closest<HTMLElement>('.theme-card,.how-card,.saved-card,.activity-card');if(!card||!root.contains(card)||card.contains((e as MouseEvent).relatedTarget as Node|null))return;run(()=>{gsap.to(card,{y:-5,duration:.25,ease:'power2.out',overwrite:'auto'});});};
   const out=(e:Event)=>{const card=(e.target as Element).closest<HTMLElement>('.theme-card,.how-card,.saved-card,.activity-card');if(!card||card.contains((e as MouseEvent).relatedTarget as Node|null))return;run(()=>{gsap.to(card,{y:0,duration:.3,ease:'power2.out',overwrite:'auto',clearProps:'transform'});});};
   const press=(e:Event)=>{const button=(e.target as Element).closest<HTMLButtonElement>('button');if(!button||button.disabled||button.closest('.stage-storyboard'))return;run(()=>{gsap.fromTo(button,{scale:.97},{scale:1,duration:.24,ease:'power2.out',overwrite:'auto',clearProps:'transform'});});};
   root.addEventListener('pointerover',over);root.addEventListener('pointerout',out);root.addEventListener('click',press);
   dispose=()=>{cancelAnimationFrame(frame);observer.disconnect();mutations.disconnect();root.removeEventListener('pointerover',over);root.removeEventListener('pointerout',out);root.removeEventListener('click',press);context.revert();};
   return dispose;
  });
  return()=>{media.revert();};
 },[scope,view,menu]);
 return null;
}
