import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CustomersService, StoreState } from '../core/customers.service';

@Component({
  selector: 'app-child',
  imports: [CommonModule],
  templateUrl: './child.component.html',
  styleUrl: './child.component.css'
})
export class ChildComponent implements OnInit {
  storeState$: Observable<StoreState> = new Observable<StoreState>();

  constructor(private customersService: CustomersService) {}

  ngOnInit() {
    this.storeState$ = this.customersService.stateChanged;
  }
}
