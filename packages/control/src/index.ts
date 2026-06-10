export * from './base-component';
export * from './control';
export * as elementTags from './element-tags';
export * from './factories';
export * from './factories-ssr';
export * from './mount';
export * from './utils';

// SSR and Hydration (explicitly export for better tree-shaking)
export {
  clearHydrationData,
  getHydratedSignals,
  hydrate,
  isHydrationAvailable,
  loadHydrationData,
  mountWithHydration,
} from './hydrate';
export {
  clearSSRContext,
  createSSRContext,
  getSSRContext,
  type HydrationData,
  type IRenderableComponent,
  isServerEnvironment,
  renderComponentToDocument,
  renderComponentToString,
  renderControlToString,
  renderToDocument,
  renderToString,
  serializeHydrationData,
  shouldUseSSR,
  type SSRContext,
} from './ssr';
