import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ExplorerControls } from './ExplorerControls';
import { advanceHelmetOrbit, helmetElevationFrame, wrapHelmetFrame as wrap } from '../../lib/helmetOrbit';
import './ProductExplorer.css';

const SPRITE = '/images/aeris-helmet-turntable.png';
const ABOVE = '/images/aeris-helmet-above.png';
const BELOW = '/images/aeris-helmet-below.png';
const ELEVATION = '/images/aeris-helmet-elevation.png';
const ORIGINAL = '/images/aeris-helmet-product.png';
const names = ['Phía trước', 'Bên trái', 'Bên phải', 'Phía sau', 'Từ trên xuống', 'Từ dưới lên'];
const frames = [0, 2, 6, 4, 8, 9];

/** Reference-based photographs, never a substituted 3D helmet. */
export default function HelmetExplorer({active,onDetail}:{active:number|null;onDetail:(index:number|null)=>void}) {
 const [frame,setFrame]=useState(-1),[view,setView]=useState(0),[zoom,setZoom]=useState(1),[custom,setCustom]=useState(false);
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 const heading=useRef(1);
 const [tilt,setTilt]=useState(0);
 const orbit=useRef({heading:1,tilt:0});
 const drag=useRef<{id:number;x:number;y:number;latestX:number;latestY:number;started:boolean}|null>(null);
 const animationFrame=useRef<number|null>(null);
 const [dragging,setDragging]=useState(false);
 useEffect(()=>{
  let cancelled=false;
  setReady(false);setFailed(false);
  const images=[SPRITE,ABOVE,BELOW,ELEVATION].map(src=>new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>image.decode().then(()=>resolve(),()=>resolve());image.onerror=()=>reject();image.src=src;}));
  Promise.all(images).then(()=>{if(!cancelled)setReady(true);}).catch(()=>{if(!cancelled)setFailed(true);});
  return()=>{cancelled=true;};
 },[attempt]);
 function choose(index:number){const nextTilt=index===4?1:index===5?-1:0;setTilt(nextTilt);if(frames[index]<8)heading.current=frames[index];orbit.current={heading:heading.current,tilt:nextTilt};setView(index);setFrame(frames[index]);setZoom(1);setCustom(false);onDetail(null);}
 function original(){setTilt(0);heading.current=1;orbit.current={heading:1,tilt:0};setFrame(-1);setView(0);setZoom(1);setCustom(false);onDetail(null);}
 function start(event:PointerEvent<HTMLDivElement>){
  if(!ready||event.button!==0)return;
  if(drag.current)return;
  event.preventDefault();event.currentTarget.focus({preventScroll:true});event.currentTarget.setPointerCapture(event.pointerId);
  drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,latestX:event.clientX,latestY:event.clientY,started:false};
 }
 function paintDrag(){
  animationFrame.current=null;
  const pointer=drag.current;if(!pointer)return;
  const dx=pointer.latestX-pointer.x,dy=pointer.latestY-pointer.y;
  if(!pointer.started&&Math.max(Math.abs(dx),Math.abs(dy))<4)return;
  pointer.started=true;
  // Increment from the latest pointer position, even at a pole. Reversing
  // direction immediately changes elevation instead of undoing overshoot.
  pointer.x=pointer.latestX;pointer.y=pointer.latestY;
  orbit.current=advanceHelmetOrbit(orbit.current,dx,dy);
  const next=orbit.current;
  heading.current=wrap(Math.round(next.heading));
  setDragging(true);setTilt(next.tilt);setFrame(heading.current);onDetail(null);
  if(Math.abs(next.tilt)>.001){setView(next.tilt>0?4:5);setCustom(Math.abs(next.tilt)<1);}
  else setCustom(true);
 }
 function move(event:PointerEvent<HTMLDivElement>){
  const pointer=drag.current;if(!pointer||pointer.id!==event.pointerId)return;
  pointer.latestX=event.clientX;pointer.latestY=event.clientY;
  if(animationFrame.current===null)animationFrame.current=requestAnimationFrame(paintDrag);
 }
 function stop(){
  if(animationFrame.current!==null){cancelAnimationFrame(animationFrame.current);paintDrag();}
  drag.current=null;setDragging(false);
 }
 useEffect(()=>()=>{if(animationFrame.current!==null)cancelAnimationFrame(animationFrame.current);},[]);
 useEffect(()=>{
  if(active===null)return;
  // Use the original photo for details so all fine features are preserved.
  orbit.current={heading:1,tilt:0};setTilt(0);setFrame(-1);setZoom(1.8);setCustom(true);
 },[active]);
 const elevation=helmetElevationFrame(tilt);
 const sideFrame=frame>=0&&frame<8?frame:heading.current;
 const origin=active===0?'52% 23%':active===1?'42% 48%':active===2?'48% 82%':'50% 50%';
 return <section className="product-explorer helmet-explorer" aria-label="Khám phá ảnh mũ bảo hiểm nhiều góc">
  <div className="explorer-top"><span className="micro-label">AERIS H1 / DESIGN STUDY</span><button className="helmet-original-button" aria-pressed={frame===-1&&active===null&&tilt===0} onClick={original}>Ảnh gốc ↗</button></div>
  <div className="explorer-canvas helmet-photo-canvas" data-dragging={dragging} tabIndex={0} role="group" aria-label="Kéo ngang để xoay, kéo xuống để nhìn từ trên và kéo lên để nhìn từ dưới. Dùng phím trái phải để đổi ảnh, phím lên để nhìn từ trên và phím xuống để nhìn từ dưới." onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} onKeyDown={event=>{
   if(!ready)return;
   if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();const next=wrap((frame<0||frame>=8?heading.current:frame)+(event.key==='ArrowRight'?1:-1));heading.current=next;orbit.current={heading:next,tilt:0};setTilt(0);setFrame(next);setCustom(true);onDetail(null);}
   if(event.key==='ArrowUp'||event.key==='ArrowDown'){event.preventDefault();choose(event.key==='ArrowUp'?4:5);}
   if(event.key==='Home'){event.preventDefault();original();}
  }}>
   <div className="helmet-photo-stage">
    <div className="helmet-turntable-art" style={{transform:`scale(${zoom})`,transformOrigin:origin}}>
     <div className="helmet-elevation-layer">
      {elevation===4||!ready?(frame===-1||!ready?<img src={ORIGINAL} alt="Ảnh gốc mũ Aeris H1 trắng ngà, kính tối và viền carbon" draggable={false}/>:<div className="helmet-turntable-frame" role="img" aria-label={`Mũ Aeris H1 — góc ${sideFrame*45} độ`} style={{backgroundImage:`url(${SPRITE})`,backgroundPosition:`${(sideFrame%4)*100/3}% ${Math.floor(sideFrame/4)*100}%`}}/>):elevation===0||elevation===8?<img src={elevation===8?ABOVE:BELOW} alt={elevation===8?'Mũ Aeris H1 từ trên xuống':'Mũ Aeris H1 từ dưới lên'} draggable={false}/>:<div className="helmet-elevation-frame" role="img" aria-label={`Mũ Aeris H1 nghiêng ${(elevation-4)*22.5} độ`} style={{backgroundImage:`url(${ELEVATION})`,backgroundPosition:`${(elevation%3)*50}% ${Math.floor(elevation/3)*50}%`}}/>}
     </div>
    </div>
   </div>
   {dragging&&<span className="helmet-angle" aria-hidden="true">{Math.abs(tilt)>.01?`${tilt>0?'Nhìn từ trên':'Nhìn từ dưới'} ${Math.round(Math.abs(tilt)*90)}°`:`${sideFrame*45}° / 360°`}</span>}
  </div>
  <ExplorerControls names={names} view={view} zoom={zoom} custom={custom} ready={ready} onChoose={choose} onZoom={setZoom}/>
  {failed?<p className="explorer-note" role="status">Chưa tải được bộ ảnh. <button className="helmet-original-button" onClick={()=>setAttempt(n=>n+1)}>Tải lại</button></p>:<p className="explorer-note">Kéo ngang để xoay · Kéo xuống: nhìn từ trên · Kéo lên: nhìn từ dưới.</p>}
 </section>;
}
