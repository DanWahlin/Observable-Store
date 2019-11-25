import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ObservableStore, DevToolsExtension } from '@codewithdan/observable-store';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Set Observable Store globalSettings here since 
// it'll be called before the rest of the app loads
ObservableStore.globalSettings = { isProduction: environment.production };

// Init Observable Store devTools
if (!ObservableStore.globalSettings.isProduction) {
  const devTools = new DevToolsExtension();
  devTools.init();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
