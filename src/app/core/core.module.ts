import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from './customers.store';
import { ClonerService } from './utilities/cloner.service';
import { SorterService } from './utilities/sorter.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [ CustomersStore, ClonerService, SorterService ]
})
export class CoreModule { }
