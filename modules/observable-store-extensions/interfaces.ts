export interface ReduxDevtoolsExtensionConnection {
  subscribe(listener: (change: unknown) => void): void;
  unsubscribe(): void;
  send(action: unknown, state: unknown): void;
  init(state?: unknown): void;
  error(anyErr: unknown): void;
}

export interface ReduxDevtoolsExtensionConfig {
  name?: string;
  features?: object | boolean;
  latency?: number;
  maxAge?: number;
  trace?: boolean;
  traceLimit?: number;
  serialize?: boolean | object;
  actionSanitizer?: (action: unknown) => unknown;
  stateSanitizer?: (state: unknown) => unknown;
  routerPropertyName?: string;
  reactRouterHistory?: { push(path: string): void };
  customRouteNavigator?: CustomReduxDevtoolsRouteNavigator;
  router?: unknown;
  ngZone?: unknown;
}

export interface ObservableStoreExtension {
  /** Function used to initialize the extension. */
  init(): void;
}

export interface CustomReduxDevtoolsRouteNavigator {
  navigate(path: string): void;
}
