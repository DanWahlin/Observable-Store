import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';
import { Theme } from '../shared/enums';
import { UserSettingsService } from '../core/user-settings.service';
import { UserSettings } from '../shared/interfaces';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-user-settings',
  imports: [CommonModule, FormsModule, SelectButton],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss'
})
export class UserSettingsComponent implements OnInit, OnDestroy {

  themes = [{label: 'Light', value: 0}, {label: 'Dark', value: 1}];
  selectedTheme = Theme.Light;
  userSettings: UserSettings = { id: 1, preferredName: '', email: '', theme: this.selectedTheme };
  subsink = new SubSink();

  constructor(private userSettingsService: UserSettingsService) { }

  ngOnInit() {
    this.subsink.sink = this.userSettingsService.getUserSettings().subscribe(settings => {
      this.userSettings = settings;
      if (settings) {
        this.selectedTheme = settings.theme;
      }
    });
  }

  updateUserSettings() {
    this.userSettingsService.updateUserSettings(this.userSettings)
      .subscribe((userSettings: any) => this.userSettings = userSettings);
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }
}
