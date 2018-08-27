import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ICustomer, IOrder, IOrderItem } from '../shared/interfaces';
import { OrdersStore } from '../core/stores/orders.store';
import { CustomersStore } from '../core/stores/customers.store';
import { AutoUnsubscribe } from '../shared/auto-unsubscribe.decorator';
import { Subscription } from 'rxjs';

@AutoUnsubscribe()
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: [ './orders.component.css' ]
})
export class OrdersComponent implements OnInit, OnDestroy {

  orders: IOrder[] = [];
  customer: ICustomer;
  ordersSub: Subscription;
  customersSub: Subscription;

  constructor(private customersStore: CustomersStore,
              private ordersStore: OrdersStore,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id');

    // Option 1: Access data directly from store
    this.customersSub = this.customersStore.getCustomer(id).subscribe((customer: ICustomer) => {
      this.customer = customer;
    });

    this.ordersSub = this.ordersStore.getOrders(id).subscribe(orders => {
      this.orders = orders;
    });

    // Option 2: Could subscribe to store stateChanged (see customers/customers.component.ts for an example)
  }

  ngOnDestroy() {
    // Using @AutoUnsubscribe() decorator on class so these aren't required
    // if (this.customersSub) {
    //   this.customersSub.unsubscribe();
    // }

    // if (this.ordersSub) {
    //   this.ordersSub.unsubscribe();
    // }
  }

}
