import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Vector3, CatmullRomCurve3 } from 'three';
import type { OrbitControls as Controls } from 'three-stdlib';
import './ProductExplorer.css';
import { ExplorerControls } from './ExplorerControls';

const views = [
 { name: 'Front', position: [0, .1, 5.8] },
 { name: 'Left', position: [-4.6, .7, 3.7] },
 { name: 'Right', position: [4.6, .7, 3.7] },
 { name: 'Back', position: [0, .6, -5.8] },
 { name: 'Above', position: [0, 5.2, 2.5] },
] as const;

// Curved lens surface with a nasal cutout, rather than a flat image on a plane.
function surface(u: number, v: number) {
 const x = (u - .5) * 3.3;
 const edge = Math.sqrt(Math.max(0, 1 - Math.pow((u - .5) * 2, 4)));
 const top = .69 * edge;
 const bottom = -.66 * edge + .43 * Math.exp(-Math.pow(x / .34, 2));
 return new Vector3(x, bottom + (top - bottom) * v, .65 - .25 * x * x);
}
function GoggleGeometry({ finish }: { finish: number }) {
 const { lens, outline, strap } = useMemo(() => {
  const lens = new BufferGeometry(), positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const width = 80, height = 24;
  const palette = finish === 1 ? ['#41237f','#db36bf','#4b81ee'] : finish === 2 ? ['#d78312','#f3bd55','#70422a'] : ['#ffbf16','#ed3d6f','#5918c5','#27b4e4'];
  for(let y=0;y<=height;y++)for(let x=0;x<=width;x++){
   const u=x/width,p=surface(u,y/height);positions.push(p.x,p.y,p.z);
   const segment=u*(palette.length-1),a=Math.min(palette.length-2,Math.floor(segment));
   const color=new Color(palette[a]).lerp(new Color(palette[a+1]),segment-a);colors.push(color.r,color.g,color.b);
   if(x<width&&y<height){const i=y*(width+1)+x;indices.push(i,i+1,i+width+1,i+1,i+width+2,i+width+1);}
  }
  lens.setAttribute('position',new Float32BufferAttribute(positions,3));lens.setAttribute('color',new Float32BufferAttribute(colors,3));lens.setIndex(indices);lens.computeVertexNormals();
  const points: Vector3[]=[];
  for(let i=0;i<=80;i++)points.push(surface(i/80,1));
  for(let i=79;i>=0;i--)points.push(surface(i/80,0));
  const outline=new CatmullRomCurve3(points,true,'centripetal');
  const strap=new BufferGeometry(),band: number[]=[],bandIndices: number[]=[];
  for(let i=0;i<=100;i++){
   const t=i/100*Math.PI;
   for(const y of [-.26,.26])band.push(1.76*Math.cos(t),y,-.08-1.7*Math.sin(t));
   if(i<100){const k=i*2;bandIndices.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  strap.setAttribute('position',new Float32BufferAttribute(band,3));strap.setIndex(bandIndices);strap.computeVertexNormals();
  return {lens,outline,strap};
 },[finish]);
 useEffect(()=>()=>{lens.dispose();strap.dispose();},[lens,strap]);
 const strapColor=finish===1?'#262830':finish===2?'#c7bea9':'#e8e9e7';
 return <group>
  <mesh geometry={strap}><meshStandardMaterial color={strapColor} roughness={.9} side={DoubleSide}/></mesh>
  <mesh position={[0,0,-.17]}><tubeGeometry args={[outline,160,.145,10,true]}/><meshStandardMaterial color="#242528" roughness={1}/></mesh>
  <mesh position={[0,0,-.04]}><tubeGeometry args={[outline,160,.075,10,true]}/><meshStandardMaterial color={finish===2?'#d1c8b5':'#17191c'} roughness={.45}/></mesh>
  <mesh geometry={lens}><meshPhysicalMaterial vertexColors metalness={.72} roughness={.14} clearcoat={1} clearcoatRoughness={.08} side={DoubleSide}/></mesh>
  {[-1,1].map(side=><group key={side} position={[side*1.66,0,-.12]}><mesh><boxGeometry args={[.17,.58,.22]}/><meshStandardMaterial color={strapColor} roughness={.65}/></mesh><mesh position={[0,0,.13]}><boxGeometry args={[.08,.4,.05]}/><meshStandardMaterial color="#373a3d" metalness={.4} roughness={.35}/></mesh></group>)}
  <mesh position={[0,0,-1.77]}><boxGeometry args={[.55,.63,.12]}/><meshStandardMaterial color={strapColor} roughness={.8}/></mesh>
  <mesh position={[0,0,-1.85]}><boxGeometry args={[.34,.41,.06]}/><meshStandardMaterial color="#5a5d60" metalness={.5} roughness={.5}/></mesh>
 </group>;
}
function Scene({view,zoom,finish,onDrag,revision}:{view:number;zoom:number;finish:number;onDrag:()=>void;revision:number}){
 const controls=useRef<Controls>(null);
 const {camera,invalidate}=useThree();
 useEffect(()=>{
  const position=views[view].position;
  camera.position.set(position[0]/zoom,position[1]/zoom,position[2]/zoom);
  camera.lookAt(0,0,-.3);controls.current?.target.set(0,0,-.3);controls.current?.update();invalidate();
 },[view,zoom,camera,invalidate,revision]);
 return <>
  <ambientLight intensity={.6}/><directionalLight position={[3,5,5]} intensity={3}/>
  <Environment resolution={128} frames={1}><Lightformer intensity={4} position={[0,4,3]} scale={[8,2,1]}/><Lightformer intensity={3} position={[-4,1,1]} rotation={[0,Math.PI/2,0]} scale={[2,5,1]}/><Lightformer intensity={2} position={[0,2,-4]} scale={[6,1,1]}/></Environment>
  <GoggleGeometry finish={finish}/>
  <OrbitControls ref={controls} enablePan={false} enableZoom={false} enableDamping={false} onStart={onDrag} minPolarAngle={.12} maxPolarAngle={Math.PI-.12}/>
 </>;
}
class ViewerBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<div className="explorer-fallback"><img src="/images/aeris-goggles.png" alt="AERIS X1 product concept"/><p>Interactive view unavailable on this device.</p></div>:this.props.children;}
}
export function ProductExplorer({finish}:{finish:number}){
 const [view,setView]=useState(0),[zoom,setZoom]=useState(1),[custom,setCustom]=useState(false),[ready,setReady]=useState(false),[revision,setRevision]=useState(0);
 const choose=(index:number)=>{setView(index);setCustom(false);setZoom(1);setRevision(value=>value+1);};
 return <section className="product-explorer" aria-label="Explore product angles">
  <div className="explorer-top"><span className="micro-label">AERIS X1 / DESIGN STUDY</span><span className="explorer-live">INTERACTIVE 3D</span></div>
  <div className="explorer-canvas" tabIndex={0} role="group" aria-label="Rotate goggles. Use Left and Right arrow keys to change view." onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();choose((view+(event.key==='ArrowRight'?1:views.length-1))%views.length);}}}>
   <ViewerBoundary><Suspense fallback={<span className="explorer-loading">Loading product view…</span>}><Canvas frameloop="demand" dpr={[1,1.5]} camera={{position:[0,.1,5.8],fov:40}} onCreated={()=>setReady(true)} gl={{alpha:true,antialias:true}}><Scene revision={revision} view={view} zoom={zoom} finish={finish} onDrag={()=>setCustom(true)}/></Canvas></Suspense></ViewerBoundary>
  </div>
  <ExplorerControls names={views.map(item=>item.name)} view={view} zoom={zoom} custom={custom} ready={ready} onChoose={choose} onZoom={setZoom}/>
  <p className="explorer-note">3D concept visualization. Final product details may vary.</p>
 </section>;
}
export default ProductExplorer;
