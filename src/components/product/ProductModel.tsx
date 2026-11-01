import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export type ProductModelProps = { modelUrl: string; onReady?: () => void };

/** Authored geometry, textures, PBR materials and relative transforms remain intact. */
export function ProductModel({ modelUrl, onReady }: ProductModelProps) {
  const { scene } = useGLTF(modelUrl);
  const { object, center, scale } = useMemo(() => {
    const object = clone(scene);
    object.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(object);
    const size = bounds.getSize(new Vector3());
    const extent = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(extent) || extent <= 0) throw new Error('Model has no visible bounds');
    return { object, center: bounds.getCenter(new Vector3()).multiplyScalar(-1), scale: 2.8 / extent };
  }, [scene]);
  useEffect(() => { onReady?.(); }, [onReady]);
  // useGLTF owns the shared cached geometry/materials/textures. Never dispose them
  // from one instance; Canvas disposes its own lights and environment on unmount.
  return <group scale={scale} dispose={null}><group position={center}><primitive object={object} /></group></group>;
}
