import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Customer, Order } from '../shared/interfaces';
import { CustomersService } from '../core/services/customers.service';
import { OrdersService } from '../core/services/orders.service';
import { Observable } from 'rxjs';
import { CapitalizePipe } from '../shared/capitalize.pipe';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink, CapitalizePipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

  customer$: Observable<Customer> = new Observable<Customer>();
  orders$: Observable<Order[]> = new Observable<Order[]>();

  constructor(private customersService: CustomersService,
              private ordersService: OrdersService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.customer$ = this.customersService.getCustomer(id);
    this.orders$ = this.ordersService.getOrders(id);
  }
}
