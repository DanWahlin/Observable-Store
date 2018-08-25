import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomersStore } from './stores/customers.store';
import { SorterService } from './utilities/sorter.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [ CustomersStore, SorterService ]
})
export class CoreModule { }
