import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { CustomersService } from './customers/customers.service';
import { Customer } from './core/model';
import { SubSink } from 'subsink';
import { UserSettingsService } from './core/user-settings.service';
import { Theme } from './shared/enums';
import { UserSettings } from './shared/interfaces';
import { Observable, of, merge } from 'rxjs';
import { map, switchMap, mergeMap, tap } from 'rxjs/operators';

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
      this.userSettingsService.stateChanged
      .pipe(
        // stateSliceSelector added to UserSettingsService which only returns userSettings
        // Could case `state as UserSettings` if wanted for intellisense
        map((state: any) => {
          return this.updateTheme(state);
        })
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
      if (userSettings) {
        this.document.documentElement.className = (userSettings.theme === Theme.Light) ? 'light-theme' : 'dark-theme';
        return userSettings;
      }
  }

}