import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from '../shared/enums';
import { UserSettingsService } from '../core/user-settings.service';
import { UserSettings } from '../shared/interfaces';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  themes: any[];
  selectedTheme: Theme;
  userSettings: UserSettings = { id: 1, preferredName: null, email: null, theme: null };
  subsink = new SubSink();

  constructor(private userSettingsService: UserSettingsService) { }

  ngOnInit() {
    this.themes = [{label: 'Light', value: 0}, {label: 'Dark', value:  1}];
    this.subsink.sink = this.userSettingsService.getUserSettings().subscribe(settings => {
      this.userSettings = settings;
      if (settings) {
        this.selectedTheme = settings.theme;
      }
    });
  }

  updateUserSettings() {
    this.userSettingsService.updateUserSettings(this.userSettings)
      .subscribe(userSettings => this.userSettings = userSettings);
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

}
