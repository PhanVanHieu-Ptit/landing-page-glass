import { useId, useState, type FormEvent } from 'react';
import { ASSETS } from '../../lib/product';
import './PurchasePanel.css';

export type PurchasePanelProps = {
  visible: boolean;
  onAddToCart?: (variantId: string) => void;
};

export type PurchaseVariant = {
  readonly id: string;
  readonly name: string;
  readonly frame: string;
  readonly lens: string;
};

/** Presentation options; replace IDs with catalog SKUs before connecting a cart. */
export const PURCHASE_PRODUCT = {
  id: 'aeris-x1',
  name: 'AERIS X1',
  description: 'A new perspective on performance. Made for the way down.',
  priceLabel: 'Price to be announced',
  maxQuantity: 10,
  variants: [
    { id: 'aeris-x1-forest', name: 'Forest / Sage', frame: '#263b30', lens: '#a8c2a4' },
    { id: 'aeris-x1-carbon', name: 'Carbon / Smoke', frame: '#303337', lens: '#9ba5ac' },
    { id: 'aeris-x1-chalk', name: 'Chalk / Amber', frame: '#d5d2c6', lens: '#c5a273' },
  ] satisfies readonly PurchaseVariant[],
} as const;

/**
 * Mount in the final commerce scene and pass that scene's active state as visible.
 * Dock the existing viewer using [data-product-dock="aeris-x1"] and its bounding
 * rect; the viewer remains responsible for canvas positioning and motion.
 * Set data-docked="true" on that target once the viewer covers the fallback.
 * The target has no transform animation, so its bounds remain stable on entrance.
 * Read data-quantity / data-variant-id on [data-purchase-panel] in the cart adapter;
 * the agreed callback intentionally receives only the selected variant ID.
 * Options and pricing are placeholders, not inventory or checkout promises.
 */
export function PurchasePanel({ visible, onAddToCart }: PurchasePanelProps) {
  const id = useId();
  const [posterFailed, setPosterFailed] = useState(false);
  const [variantId, setVariantId] = useState<string>(PURCHASE_PRODUCT.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const variant = PURCHASE_PRODUCT.variants.find(option => option.id === variantId)!;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAddToCart?.(variantId);
  }

  return (
    <section className="purchase-panel" data-purchase-panel data-visible={visible}
      data-variant-id={variantId} data-quantity={quantity} aria-labelledby={`${id}-title`}
      inert={!visible}>
      <div className="purchase-panel__display" data-product-dock="aeris-x1"
        aria-label={`${PURCHASE_PRODUCT.name} product display`}>
        <span className="purchase-panel__display-label">AERIS / EQUIPMENT 001</span>
        <div className="purchase-panel__fallback">
          {ASSETS.productPoster.src && !posterFailed ? (
            <img onError={() => setPosterFailed(true)} src={ASSETS.productPoster.src} alt={ASSETS.productPoster.alt} />
          ) : (
            <svg viewBox="0 0 640 360" role="img" aria-label={`AERIS X1 concept illustration in ${variant.name}`}>
              <title>AERIS X1 concept illustration</title>
              <ellipse cx="320" cy="285" rx="180" ry="14" fill="#000" opacity=".22" />
              <path d="M120 144 47 123v85l82-12m382-52 82-21v85l-82-12" fill={variant.frame} stroke="#ffffff26" strokeWidth="3" />
              <path d="M111 125Q320 61 529 125l-20 105q-16 37-67 34l-84-20q-38-13-76 0l-84 20q-51 3-67-34Z" fill={variant.frame} stroke="#ffffff45" strokeWidth="3" />
              <path d="M135 140q185-56 370 0l-17 81q-9 25-43 22l-88-21q-37-11-74 0l-88 21q-34 3-43-22Z" fill={variant.lens} />
              <path d="M151 149q170-46 338-2l-6 25q-147-48-325 14Z" fill="#fff" opacity=".21" />
              <path d="m178 231 51-99m-27 105 56-111" stroke="#fff" strokeWidth="2" opacity=".13" />
            </svg>
          )}
        </div>
        <div className="purchase-panel__display-footer"><span>DESIGNED FOR PERSPECTIVE</span><span>{ASSETS.productPoster.src ? 'X1 / 01' : 'CONCEPT PREVIEW'}</span></div>
      </div>

      <form className="purchase-panel__content" onSubmit={submit}>
        <p className="purchase-panel__eyebrow">YOUR NEXT PERSPECTIVE</p>
        <h2 id={`${id}-title`} className="purchase-panel__title">AERIS <span>X1</span></h2>
        <p className="purchase-panel__description">{PURCHASE_PRODUCT.description}</p>
        <fieldset className="purchase-panel__variants">
          <legend>01 / FINISH <span>{variant.name}</span></legend>
          <div className="purchase-panel__options">
            {PURCHASE_PRODUCT.variants.map(option => (
              <label key={option.id} className="purchase-panel__option">
                <input type="radio" name={`${id}-variant`} value={option.id}
                  checked={variantId === option.id} onChange={() => setVariantId(option.id)} />
                <span className="purchase-panel__swatch" style={{ background: option.frame }} aria-hidden="true"><span style={{ background: option.lens }} /></span>
                <span>{option.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="purchase-panel__order">
          <div><label className="purchase-panel__label" htmlFor={`${id}-quantity`}>02 / QUANTITY</label>
            <div className="purchase-panel__quantity">
              <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)}>−</button>
              <select id={`${id}-quantity`} name="quantity" value={quantity} onChange={event => setQuantity(Number(event.target.value))}>
                {Array.from({ length: PURCHASE_PRODUCT.maxQuantity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}
              </select>
              <button type="button" aria-label="Increase quantity" disabled={quantity >= PURCHASE_PRODUCT.maxQuantity} onClick={() => setQuantity(value => value + 1)}>+</button>
            </div>
          </div>
          <div className="purchase-panel__price"><span>PRICE</span><strong>{PURCHASE_PRODUCT.priceLabel}</strong></div>
        </div>
        <button className="purchase-panel__cta" type="submit" disabled={!onAddToCart} aria-describedby={`${id}-cart-note`}><span>Add to cart</span><span aria-hidden="true">↗</span></button>
        <p id={`${id}-cart-note`} className="purchase-panel__note">{onAddToCart ? 'Select your finish. Find your perspective.' : 'Purchasing available when the store is connected.'}</p>
      </form>
    </section>
  );
}
