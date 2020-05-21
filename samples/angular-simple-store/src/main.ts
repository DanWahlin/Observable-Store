import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Set Observable Store globalSettings here since 
// it'll be called before the rest of the app loads
ObservableStore.globalSettings = { isProduction: environment.production };

// Enable Redux DevTools support. Ensure that RouterModule.forRoot() is called in app.module.
if (!environment.production) {
  ObservableStore.addExtension(new ReduxDevToolsExtension({ router: Router, ngZone: NgZone }));
}

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.log(err));
