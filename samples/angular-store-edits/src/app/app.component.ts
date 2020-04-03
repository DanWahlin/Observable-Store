import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { CustomersService } from './customers/customers.service';
import { UserSettingsService } from './core/user-settings.service';
import { Theme } from './shared/enums';
import { UserSettings } from './shared/interfaces';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  customersLength$: Observable<number>;
  userSettings$: Observable<UserSettings>;

  constructor(@Inject(DOCUMENT) private document: HTMLDocument, 
    private customersService: CustomersService,
    private userSettingsService: UserSettingsService) { }

  ngOnInit() {
    this.userSettings$ = merge(
      this.userSettingsService.getUserSettings(),
      this.userSettingsService.userSettingsChanged()
        .pipe(
          map(userSettings => this.updateTheme(userSettings))
        )
    );

    this.customersLength$ = this.customersService.stateChanged
        .pipe(
          map(state => {
            if (state && state.customers) {
              return state.customers.length;
            }
          })
        );
  }

  updateTheme(userSettings: UserSettings) {      
      this.document.documentElement.className = (userSettings && userSettings.theme === Theme.Dark) ? 'dark-theme' : 'light-theme';
      return userSettings;
  }

}