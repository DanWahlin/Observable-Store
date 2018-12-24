import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Customer, Order } from '../shared/interfaces';
import { CustomersService } from '../core/services/customers.service';
import { OrdersService } from '../core/services/orders.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: [ './orders.component.css' ]
})
export class OrdersComponent implements OnInit, OnDestroy {

  customer$: Observable<Customer>;
  orders$: Observable<Order[]>;

  constructor(private customersService: CustomersService,
              private ordersService: OrdersService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id');

    // Option 1: Access data directly from store
    this.customer$ = this.customersService.getCustomer(id);
    this.orders$ = this.ordersService.getOrders(id);

    // Option 2: Could subscribe to store stateChanged (see customers/customers.component.ts for an example)
  }

  ngOnDestroy() {

  }

}
