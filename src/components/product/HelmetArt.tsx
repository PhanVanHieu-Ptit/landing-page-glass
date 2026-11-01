/** Photorealistic concept artwork shared by the film and product explorer. */
export function HelmetArt({ active }: { active?: number }) {
 return <div className="helmet-art helmet-photo" data-detail={active}>
  <img src="/images/aeris-helmet-product.png" alt="Mũ bảo hiểm full-face trắng ngà, kính chắn tối màu và chi tiết carbon đen" draggable={false} decoding="async"/>
  {active !== undefined && <span className={`helmet-photo-marker helmet-photo-marker--${active}`} aria-hidden="true"><i/>{['Vỏ ngoài', 'Vùng đệm bên trong', 'Hệ thống cố định'][active]}</span>}
 </div>;
}
