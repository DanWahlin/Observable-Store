import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Theme, Actions } from '../shared/enums';
import { ObservableStore } from '@codewithdan/observable-store';
import { StoreState, UserSettings } from '../shared/interfaces';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  apiUrl = 'api/userSettings';

  constructor(private http: HttpClient) {

  }

  getUserSettings() : Observable<UserSettings> {
    return this.http.get<UserSettings>(this.apiUrl)
      .pipe(
        map(userSettings => {
          let settings = userSettings[0]; // in-memory API returns an array but we only want one item
          // Add State to Store Here


          return settings;
        }),
        catchError(this.handleError)
      );
  }

  updateUserSettings(userSettings: UserSettings) {
    return this.http.put(this.apiUrl + '/' + userSettings.id, userSettings)
        .pipe(
            switchMap(settings => {
                // Update userSettings Here

                
                return this.getUserSettings();
            }),
            catchError(this.handleError)
        );
  }

  userSettingsChanged() : Observable<UserSettings> {
    return this.stateChanged
      .pipe(
        // stateSliceSelector could be added to UserSettingsService contructor to filter the store down to userSettings
        map(state => {
          if (state) {
            return state.userSettings;
          }
        }) 
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
