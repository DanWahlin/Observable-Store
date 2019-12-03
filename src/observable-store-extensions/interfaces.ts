import { Observable, Subscription } from "rxjs";

export interface ReduxDevtoolsExtensionConnection {
  subscribe(listener: (change: any) => void): void;
  unsubscribe(): void;
  send(action: any, state: any): void;
  init(state?: any): void;
  error(anyErr: any): void;
}

export interface ReduxDevtoolsExtensionConfig {
  name?: string;
  routerPropertyName?: string;
}

export interface ReduxDevtoolsExtension {
  connect(
    options: ReduxDevtoolsExtensionConfig
  ): ReduxDevtoolsExtensionConnection;
  send(action: any, state: any, options: ReduxDevtoolsExtensionConfig): void;
}

export interface ObservableStoreExtension {
  /**
   * Function used to initialize the extension.
   */
  init(config?: any): Observable<never> | Subscription;
}