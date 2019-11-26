import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ObservableStore, ReduxDevToolsExtension } from '@codewithdan/observable-store';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Set Observable Store globalSettings here since 
// it'll be called before the rest of the app loads
ObservableStore.globalSettings = { isProduction: environment.production };
ObservableStore.addExtension(new ReduxDevToolsExtension());

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
