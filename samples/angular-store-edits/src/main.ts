import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from './environments/environment';
import { AppDevModule } from './app/app-dev.module';
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

if (environment.production) {
  enableProdMode();
}

// Set ObservableStore globalSettings here since 
// it'll be called before the rest of the app loads
ObservableStore.globalSettings = { 
  isProduction: environment.production,
  trackStateHistory: !environment.production,
  logStateChanges: !environment.production
};

// Optional: Initialize store state
ObservableStore.initializeState({});

// Add Redux DevTools extensions support
if (!environment.production) {
  ObservableStore.addExtension(new ReduxDevToolsExtension({ router: Router, ngZone: NgZone }));
}

// platformBrowserDynamic().bootstrapModule(AppModule)
// Bootstrap dev module that uses HttpClientInMemoryWebApiModule
platformBrowser()
  .bootstrapModule(AppDevModule)
  .catch(err => console.log(err));
