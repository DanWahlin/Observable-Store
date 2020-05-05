import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppDevModule } from './app/app-dev.module';
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

if (environment.production) {
  enableProdMode();
}

// Set ObservableStore globalSettings here since 
// it'll be called before the rest of the app loads



// Optional: Initialize store state


// Add Redux DevTools extensions support


// platformBrowserDynamic().bootstrapModule(AppModule)
// Bootstrap dev module that uses HttpClientInMemoryWebApiModule
platformBrowserDynamic()
  .bootstrapModule(AppDevModule)
  .catch(err => console.log(err));
