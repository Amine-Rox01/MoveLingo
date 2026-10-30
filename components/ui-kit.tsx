'use client';
import {useRef,useEffect,type ReactNode} from 'react';
import {gsap} from 'gsap';
import {X,Clock} from 'lucide-react';
export function IconLabel({children,icon:Icon}:{children:ReactNode;icon:typeof Clock}){return <span className="icon-label"><Icon size={15}/>{children}</span>}
export function Button({children,onClick,variant='',disabled=false,type='button'}:{children:ReactNode;onClick?:()=>void;variant?:string;disabled?:boolean;type?:'button'|'submit'}){return <button type={type} className={`btn ${variant}`} onClick={onClick} disabled={disabled}>{children}</button>}
export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{ref.current?.showModal();const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',()=>{const tween=gsap.fromTo(ref.current,{opacity:0,y:18,scale:.97},{opacity:1,y:0,scale:1,duration:.3,ease:'power2.out',clearProps:'opacity,transform'});return()=>{tween.revert()};});return()=>mm.revert()},[]);return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal-head"><h2>{title}</h2><button aria-label="Close dialog" className="icon-btn" onClick={onClose}><X/></button></div>{children}</dialog>}
