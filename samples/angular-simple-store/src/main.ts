import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { ObservableStore } from '@codewithdan/observable-store';

// Set Observable Store globalSettings here since
// it'll be called before the rest of the app loads
ObservableStore.globalSettings = { isProduction: false };

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
