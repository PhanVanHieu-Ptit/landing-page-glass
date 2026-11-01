type Props = {
 names: readonly string[]; view: number; zoom: number; custom: boolean; ready: boolean;
 onChoose: (index: number) => void; onZoom: (zoom: number) => void;
};

/** Both product viewers share the same controls and zoom limits. */
export function ExplorerControls({names,view,zoom,custom,ready,onChoose,onZoom}:Props) {
 return <>
  <div className="explorer-caption"><span>{custom?'Free view':names[view]} <span className="explorer-muted">/ {String(view+1).padStart(2,'0')}</span></span><div className="explorer-zoom"><button aria-label="Zoom out" disabled={zoom<=.8||!ready} onClick={()=>onZoom(Math.max(.8,Math.round((zoom-.2)*10)/10))}>−</button><span>{Math.round(zoom*100)}%</span><button aria-label="Zoom in" disabled={zoom>=1.8||!ready} onClick={()=>onZoom(Math.min(1.8,Math.round((zoom+.2)*10)/10))}>+</button><button aria-label="Reset product view" disabled={!ready} onClick={()=>onChoose(0)}>↺</button></div></div>
  <div className="explorer-views" aria-label="Product viewpoints">{names.map((name,index)=><button key={name} disabled={!ready} aria-pressed={view===index&&!custom} onClick={()=>onChoose(index)}><span>0{index+1}</span>{name}</button>)}</div>
  <p className="explorer-hint">Drag to rotate · Swipe to explore · + to see closer</p>
 </>;
}
