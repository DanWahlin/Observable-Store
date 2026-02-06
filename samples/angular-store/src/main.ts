import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { ObservableStore } from '@codewithdan/observable-store';
import { ReduxDevToolsExtension } from '@codewithdan/observable-store-extensions';

// Set ObservableStore globalSettings here since
// it'll be called before the rest of the app loads
ObservableStore.globalSettings = {
  isProduction: false,
  trackStateHistory: true,
};

// Enable Redux DevTools integration
ObservableStore.addExtension(new ReduxDevToolsExtension());

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
