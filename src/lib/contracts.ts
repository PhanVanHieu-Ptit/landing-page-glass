/** Shared API. Frame callbacks must mutate refs/DOM/Three objects, never React state. */
export type SceneId = 'alpine' | 'equip' | 'dissolve' | 'approach' | 'viewer' | 'commerce';
export type MotionMode = 'full' | 'reduced';
export type ViewportMode = 'desktop' | 'mobile';
export type AssetStatus = 'placeholder' | 'loading' | 'ready' | 'error';
export interface SceneRange { id: SceneId; label: string; start: number; end: number; description: string }
export interface SceneFrame { progress: number; localProgress: number; active: boolean; motion: MotionMode; viewport: ViewportMode }
export interface SceneController { update(frame: SceneFrame): void; dispose(): void }
export interface SceneContract { id: SceneId; mount(host: HTMLElement, context: SceneContext): SceneController }
export interface SceneContext { assets: AssetManifest; product: ProductIdentity; motion: MotionMode; viewport: ViewportMode }
export interface MediaAsset { src: string | null; status: AssetStatus; alt: string; poster?: string; license?: string }
export interface AssetManifest { alpineFilm: MediaAsset; goggleModel: MediaAsset; productPoster: MediaAsset }
export interface ProductIdentity { id: string; name: string; frameColor: string; lensColor: string; accentColor: string }
/** One persistent product owns these transforms through approach → viewer → dock. */
export interface ProductPose { position: [number, number, number]; rotation: [number, number, number]; scale: number }
export interface ProductHandle { setPose(pose: ProductPose): void; setInteractive(enabled: boolean): void; resetView(): void }
