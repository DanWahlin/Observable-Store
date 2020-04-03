import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Theme, Actions } from '../shared/enums';
import { ObservableStore } from '@codewithdan/observable-store';
import { StoreState, UserSettings } from '../shared/interfaces';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService extends ObservableStore<StoreState> {

  apiUrl = 'api/userSettings';

  constructor(private http: HttpClient) {
    super({ stateSliceSelector: state => state.userSettings });
  }

  getUserSettings() {
    return this.http.get<UserSettings>(this.apiUrl)
      .pipe(
        map(userSettings => {
          let settings = userSettings[0]; // in-memory API returns an array but we want one item
          this.setState({ userSettings: settings }, Actions.SetUserSettings);
          return settings;
        }),
        catchError(this.handleError)
      );
  }

  updateUserSettings(userSettings: UserSettings) {
    return this.http.put(this.apiUrl + '/' + userSettings.id, userSettings)
        .pipe(
            switchMap(settings => {
                // update local store with updated settings data
                // not required of course unless the store cache is needed 
                this.setState( { userSettings }, Actions.UpdateUserSettingsTheme);
                return this.getUserSettings();
            }),
            catchError(this.handleError)
        );
  }

  userSettingsChanged() : Observable<UserSettings> {
    return this.stateChanged
      .pipe(
        // stateSliceSelector added to UserSettingsService which only returns userSettings
        // Could case `state as UserSettings` if wanted for intellisense
        map((state: any) => state as UserSettings) 
      );
  }

  private handleError(error: any) {
    console.error('server error:', error);
    if (error.error instanceof Error) {
      const errMessage = error.error.message;
      return Observable.throw(errMessage);
    }
    return Observable.throw(error || 'Server error');
  }
}
