import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from '../hooks/useMediaQuery';
import './LandingPage.css';
const ProductExplorer = lazy(() => import('../components/product/ProductExplorer'));
gsap.registerPlugin(ScrollTrigger);
const finishes = [{name:'Glacier / Prizm',color:'#d8dfdf',lens:'prizm'},{name:'Carbon / Violet',color:'#292a30',lens:'violet'},{name:'Chalk / Amber',color:'#d6c7ab',lens:'amber'}];
function Goggles({finish=0}:{finish?:number}) {return <div className={`goggle-art goggle-art--${finishes[finish].lens}`}><img src="/images/aeris-goggles.png" alt={`AERIS X1 concept goggles — ${finishes[finish].name}`} draggable="false" /></div>;}
export function LandingPage() {
 const root=useRef<HTMLElement>(null);
 const reduced=useMediaQuery('(prefers-reduced-motion: reduce)');
 const [chapter,setChapter]=useState(0),[finish,setFinish]=useState(0),[detailsOpen,setDetailsOpen]=useState(false),[storyOpen,setStoryOpen]=useState(false);
 const storyButton=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const host=root.current;if(!host||reduced)return;
  const context=gsap.context(()=>{
   const tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:host,start:'top top',end:'bottom bottom',scrub:.35,onUpdate:self=>{setChapter(self.progress<.27?0:self.progress<.55?1:2);host.style.setProperty('--scroll-progress',String(self.progress));}}});
   tl.to('.film-image',{scale:1.12,duration:.27},0).to('.hero-type',{opacity:0,y:-35,duration:.12},.15)
    .to('.film-image',{opacity:0,duration:.15},.24)
    .fromTo('.floating-goggles',{opacity:0,scale:.62,rotateY:-24,rotateZ:-8},{opacity:1,scale:1,rotateY:0,rotateZ:0,duration:.19},.27)
    .fromTo('.optics-copy',{opacity:0,y:20},{opacity:1,y:0,duration:.09},.39).to('.optics-copy',{opacity:0,duration:.07},.55)
    .to('.floating-goggles',{scale:1.85,xPercent:-24,rotateY:32,rotateZ:-9,duration:.22},.57)
    .fromTo('.detail-copy',{opacity:0},{opacity:1,duration:.09},.64).to('.detail-copy',{opacity:0,duration:.07},.84)
    .to('.floating-goggles',{scale:.85,xPercent:0,rotateY:0,rotateZ:0,duration:.13},.87);
  },host);return ()=>context.revert();
 },[reduced]);
 useLayoutEffect(()=>{if(!storyOpen)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();return()=>{document.body.style.overflow=old;storyButton.current?.focus();};},[storyOpen]);
 return <div className="aeris-site">
 <a className="skip-link" href="#shop">Skip to product</a>
 <header className="aeris-nav"><a href="#top" className="aeris-logo" aria-label="AERIS home">AERIS<span>®</span></a><nav aria-label="Main navigation"><a href="#optics">Optics</a><a href="#field-notes">Field notes</a><button ref={storyButton} onClick={()=>setStoryOpen(true)}>Our story</button></nav><a className="shop-link" href="#shop"><span className="status-dot"/> EXPLORE X1 <span>↗</span></a></header>
 <main><section ref={root} id="top" className="product-film" aria-label="AERIS X1 scroll experience"><div className="film-stage">
  <div className="film-image"><img src="/images/aeris-alpine.jpg" alt="Alpine skier in white winter gear wearing iridescent goggles in the snow" fetchPriority="high"/></div>
  <div className="hero-type"><p className="film-kicker">SCROLL ↓ — SEE BEYOND</p><h1>Aeris X1<span>®</span></h1><div className="hero-bottom"><p>A clearer perspective.<br/>A different kind of altitude.</p><p className="hero-manifesto">For the first chair and the last light.<br/>For the moments when everything falls away.<br/>Just you. And what comes next.</p></div></div>
  <div className="floating-goggles"><Goggles/></div>
  <div className="optics-copy"><span className="micro-label">01 — A NEW PERSPECTIVE</span><h2>Everything fades.<br/><span>Clarity stays.</span></h2><p>Less between you and the mountain.</p></div>
  <div className="detail-copy"><span className="micro-label">02 — A CLOSER LOOK</span><h2>Considered.<br/>From every angle.</h2><p>A study in form, light, and perspective.</p></div>
  <div className="film-foot" data-dark={chapter>0}><span>ALPINE OPTICS / EQUIPMENT 001</span><div className="film-chapters" aria-label={`Chapter ${chapter+1} of 3`}><span className={chapter===0?'active':''}>01</span><i/><span className={chapter===1?'active':''}>02</span><i/><span className={chapter===2?'active':''}>03</span></div><span>EST. ABOVE THE ORDINARY ↗</span></div><div className="film-progress" aria-hidden="true"><span/></div>
 </div><div id="optics" className="film-anchor film-anchor--optics"/><div id="field-notes" className="film-anchor film-anchor--details"/></section>
 <section className="aeris-shop" id="shop" aria-labelledby="shop-title"><div className="shop-display"><span className="micro-label">AERIS / EQUIPMENT 001</span><Suspense fallback={<Goggles finish={finish}/>}><ProductExplorer finish={finish}/></Suspense><div className="display-bottom"><span>THE X1 COLLECTION</span><span>CONCEPT EDITION / 01</span></div></div>
 <div className="shop-content"><p className="micro-label">YOUR NEXT PERSPECTIVE</p><h2 id="shop-title">Aeris X1<span>®</span></h2><p className="shop-description">Made for the way down.<br/>Designed to see beyond.</p>
 <fieldset className="finish-options"><legend>FINISH <span>{finishes[finish].name}</span></legend><div>{finishes.map((item,index)=><label key={item.name} title={item.name}><input type="radio" name="finish" value={index} checked={finish===index} onChange={()=>setFinish(index)}/><span style={{background:item.color}}/><span className="sr-only">{item.name}</span></label>)}</div></fieldset>
 <div className="availability"><span>THE NEXT CHAPTER</span><span>Coming soon</span></div><button className="enquire-button" aria-expanded={detailsOpen} aria-controls="product-details" onClick={()=>setDetailsOpen(!detailsOpen)}>Explore the details <span>↗</span></button><p className="concept-note">A product concept. Availability and final specifications to be announced.</p>
 <button className="details-toggle" aria-expanded={detailsOpen} aria-controls="product-details" onClick={()=>setDetailsOpen(!detailsOpen)}>Behind the design <span>{detailsOpen?'−':'+'}</span></button><div id="product-details" hidden={!detailsOpen} className="product-details">The X1 explores a panoramic silhouette, a reflective lens and a pared-back alpine palette. This interactive edition presents the design direction; production materials, fit and optical specifications are still being finalized. Finish previews illustrate the intended palette.</div>
 </div></section>
 <section className="aeris-end"><span className="micro-label">SEE YOU UP THERE.</span><p>Above the<br/><em>ordinary.</em></p><a href="#top">BACK TO THE SUMMIT ↑</a></section></main>
 <footer className="aeris-footer"><a href="#top" className="aeris-logo">AERIS<span>®</span></a><span>ALPINE OPTICS. A NEW PERSPECTIVE.</span><span>© {new Date().getFullYear()} AERIS</span></footer>
 {storyOpen&&<div className="story-backdrop" onClick={()=>setStoryOpen(false)}><section ref={dialog} className="story-dialog" role="dialog" aria-modal="true" aria-labelledby="story-title" onClick={event=>event.stopPropagation()} onKeyDown={event=>{if(event.key==='Escape')setStoryOpen(false);if(event.key==='Tab'){const items=dialog.current?.querySelectorAll<HTMLElement>('button,a');if(!items?.length)return;const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}}}><button onClick={()=>setStoryOpen(false)} aria-label="Close story">CLOSE ×</button><span className="micro-label">THE AERIS POINT OF VIEW</span><h2 id="story-title">A little higher.<br/>A little clearer.</h2><p>AERIS X1 is an alpine optics concept built around a simple idea: when the distractions fall away, a new perspective opens up. This experience is a study of that moment.</p><a href="#shop" onClick={()=>setStoryOpen(false)}>Discover the X1 ↗</a></section></div>}
 </div>;
}
