import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { UserSettingsComponent } from './user-settings/user-settings.component';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    SelectButtonModule
  ],
  declarations: [AppComponent, UserSettingsComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
