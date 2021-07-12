import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomersService, StoreState } from '../core/customers.service';

@Component({
  selector: 'app-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.css']
})
export class ChildComponent implements OnInit {
  storeState$: Observable<StoreState> = new Observable<StoreState>();

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.storeState$ = this.customersService.stateChanged;
  }

}
