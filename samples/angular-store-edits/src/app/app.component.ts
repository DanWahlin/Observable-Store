import { Component, OnInit, OnDestroy } from '@angular/core';
import { CustomersService } from './customers/customers.service';
import { Customer } from './core/model';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  customers: Customer[] = [];
  subsink = new SubSink();

  constructor(private customersService: CustomersService) { }

  ngOnInit() {
    this.subsink.sink = this.customersService.stateChanged.subscribe(state => {
      if (state && state.customers) {
        this.customers = state.customers;
      }
    });
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

}
