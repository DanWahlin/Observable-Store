import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';

import { Customer } from '../../core/model/customer';
import { CustomersService } from '../customers.service';

@Component({
  selector: 'app-customers-edit',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './customers-edit.component.html',
  styleUrl: './customers-edit.component.scss'
})
export class CustomersEditComponent implements OnInit, OnDestroy {

  private formBuilder = inject(FormBuilder);

  customerForm: UntypedFormGroup = this.formBuilder.group({
    id: [],
    name: [ '', Validators.required ],
    city: [ '', Validators.required ]
  });

  customer: Customer | null = null;
  subsink = new SubSink();

  constructor(
      private customersService: CustomersService,
      private router: Router,
      private route: ActivatedRoute) { }

  ngOnInit() {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.subsink.sink = this.customersService.get(id).subscribe(customer => {
        if (customer) {
          this.customer = customer;
          this.customerForm.patchValue(this.customer);
        }
      });
  }

  submit() {
    if (this.customerForm.valid) {
      const customerValue = { ...this.customer, ...this.customerForm.value } as Customer;
      if (customerValue.id) {
        this.update(customerValue);
      }
      else {
        this.add(customerValue);
      }
    }
  }

  add(customer: Customer) {
    this.subsink.sink = this.customersService.add(customer).subscribe(() => {
      this.navigateHome();
    });
  }

  delete() {
    if (this.customer?.id) {
      this.subsink.sink = this.customersService.delete(this.customer.id).subscribe(() => {
        this.navigateHome();
      });
    }
  }

  update(customer: Customer) {
    this.subsink.sink = this.customersService.update(customer).subscribe(() => {
      this.navigateHome();
    });
  }

  navigateHome() {
    this.router.navigate(['/customers']);
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }
}
