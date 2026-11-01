import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HelmetArt } from '../components/product/HelmetArt';
import { useMediaQuery } from '../hooks/useMediaQuery';

const HelmetExplorer = lazy(() => import('../components/product/HelmetExplorer'));
gsap.registerPlugin(ScrollTrigger);

export function HelmetPage() {
 const root = useRef<HTMLElement>(null);
 const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
 const [chapter, setChapter] = useState(0);
 const [active, setActive] = useState<number | null>(null);
 const layers = [
  { name: 'Vỏ ngoài', description: 'Đường nét khí động học lấy cảm hứng từ chuyển động của vận động viên đua xe.' },
  { name: 'Kính chắn', description: 'Xem gần độ cong của kính chắn, mép kính và khớp gắn hai bên mũ.' },
  { name: 'Cằm & khe gió', description: 'Quan sát phần bảo vệ cằm, khe thông gió và đường viền phía dưới mũ.' },
 ];
 useLayoutEffect(() => {
  const host = root.current;
  if (!host || reduced) return;
  const context = gsap.context(() => {
   const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    trigger: host, start: 'top top', end: 'bottom bottom', scrub: .35,
    onUpdate: self => {setChapter(self.progress < .27 ? 0 : self.progress < .55 ? 1 : 2);host.style.setProperty('--scroll-progress', String(self.progress));},
   }});
   tl.to('.film-image', { scale: 1.12, duration: .27 }, 0)
    .to('.hero-type', { opacity: 0, y: -35, duration: .12 }, .15)
    .to('.film-image', { opacity: 0, duration: .15 }, .24)
    .fromTo('.floating-helmet', { opacity: 0, scale: .62, rotateY: -24, rotateZ: -8 }, { opacity: 1, scale: 1, rotateY: 0, rotateZ: 0, duration: .19 }, .27)
    .fromTo('.optics-copy', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .09 }, .39)
    .to('.optics-copy', { opacity: 0, duration: .07 }, .55)
    .to('.floating-helmet', { scale: 1.85, xPercent: -24, rotateY: 32, rotateZ: -9, duration: .22 }, .57)
    .fromTo('.detail-copy', { opacity: 0 }, { opacity: 1, duration: .09 }, .64)
    .to('.detail-copy', { opacity: 0, duration: .07 }, .84)
    .to('.floating-helmet', { scale: .85, xPercent: 0, rotateY: 0, rotateZ: 0, duration: .13 }, .87);
  }, host);
  return () => context.revert();
 }, [reduced]);
 return <div className="aeris-site helmet-page" lang="vi">
  <a className="skip-link" href="#helmet-shop">Đến sản phẩm</a>
  <header className="aeris-nav"><a href="#top" className="aeris-logo" aria-label="AERIS home">AERIS<span>®</span></a><nav aria-label="Điều hướng mũ bảo hiểm"><a href="#helmet-design">Thiết kế</a><a href="#helmet-structure">Cấu trúc</a></nav><a className="shop-link" href="#helmet-shop"><span className="status-dot"/> KHÁM PHÁ MŨ <span>↗</span></a></header>
  <main>
   <section ref={root} id="top" className="product-film helmet-film" aria-label="Trải nghiệm mũ bảo hiểm theo cuộn">
    <div className="film-stage">
     <div className="film-image helmet-race-scene">
      <img src="/images/aeris-helmet-racer.jpg" alt="Ảnh minh họa chân thật vận động viên đội mũ full-face trắng ngà trên đường đua" fetchPriority="high"/>

     </div>
     <div className="hero-type"><p className="film-kicker">CUỘN ĐỂ KHÁM PHÁ ↓</p><h1>Aeris H1<span>®</span></h1><div className="hero-bottom"><p>Mũ bảo hiểm thể thao.<br/>Cảm hứng từ đường đua.</p><p className="hero-manifesto">Từ vận động viên đua xe<br/>đến cấu trúc bảo vệ của mũ.</p></div></div>
     <div className="floating-helmet"><HelmetArt/></div>
     <div className="optics-copy"><span className="micro-label">01 — TỪ ĐƯỜNG ĐUA</span><h2>Theo chuyển động.<br/><span>Đến từng đường nét.</span></h2><p>Thiết kế lấy cảm hứng từ vận động viên đua xe.</p></div>
     <div className="detail-copy"><span className="micro-label">02 — KHÁM PHÁ CẤU TRÚC</span><h2>Từng lớp.<br/>Từng chi tiết.</h2><p>Cận cảnh vỏ mũ, kính chắn và những đường nét hoàn thiện.</p><a className="helmet-explore-link" href="#helmet-shop">Tự xoay mũ 360° ↗</a></div>
     <div className="film-foot" data-dark={chapter>0}><span>SPORT HELMET / EQUIPMENT 002</span><div className="film-chapters" aria-label={`Chương ${chapter+1} trên 3`}><span className={chapter===0?'active':''}>01</span><i/><span className={chapter===1?'active':''}>02</span><i/><span className={chapter===2?'active':''}>03</span></div><span>DESIGNED IN MOTION ↗</span></div>
     <div className="film-progress" aria-hidden="true"><span/></div>
    </div>
    <div id="helmet-design" className="film-anchor film-anchor--optics"/><div id="helmet-structure" className="film-anchor film-anchor--details"/>
   </section>
   <section className="aeris-shop helmet-shop" id="helmet-shop" aria-labelledby="helmet-shop-title">
    <div className="shop-display"><span className="micro-label">AERIS / EQUIPMENT 002</span><Suspense fallback={<HelmetArt/>}><HelmetExplorer active={active} onDetail={setActive}/></Suspense><div className="display-bottom"><span>THE H1 COLLECTION</span><span>CONCEPT EDITION / 02</span></div></div>
    <div className="shop-content"><p className="micro-label">THIẾT KẾ TỪ CHUYỂN ĐỘNG</p><h2 id="helmet-shop-title">Aeris H1<span>®</span></h2><p className="shop-description">Mũ bảo hiểm thể thao.<br/>Từ vận động viên đua xe đến cấu trúc bảo vệ của mũ.</p>
     <div className="helmet-layers" role="group" aria-label="Khám phá cấu trúc mũ">{layers.map((layer,index)=><button key={layer.name} aria-pressed={active===index} aria-controls="helmet-layer-description" onClick={()=>setActive(index)}><span>0{index+1}</span>{layer.name}<span aria-hidden="true">↗</span></button>)}</div>
     <p id="helmet-layer-description" className="helmet-layer-description" aria-live="polite">{active === null ? 'Kéo trực tiếp trên mũ để xoay 360°. Chọn một chi tiết bên trên để xem cận cảnh.' : layers[active].description}</p>
     <div className="availability"><span>CHƯƠNG TIẾP THEO</span><span>Sắp ra mắt</span></div><p className="concept-note">Sản phẩm ý tưởng. Thông số, chứng nhận bảo hộ và thời điểm mở bán sẽ được công bố khi hoàn thiện.</p>
    </div>
   </section>
   <section className="aeris-end"><span className="micro-label">DESIGNED IN MOTION.</span><p>Chuyển động.<br/><em>Vươn xa.</em></p><a href="#top">VỀ ĐẦU TRANG ↑</a></section>
  </main>
  <footer className="aeris-footer"><a href="#top" className="aeris-logo">AERIS<span>®</span></a><span>SPORT HELMET. DESIGNED IN MOTION.</span><span>© {new Date().getFullYear()} AERIS</span></footer>
 </div>;
}
