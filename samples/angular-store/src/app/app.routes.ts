import { Routes } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { OrdersComponent } from './orders/orders.component';

export const routes: Routes = [
  { path: 'customers', component: CustomersComponent },
  { path: 'orders/:id', component: OrdersComponent },
  { path: '', pathMatch: 'full', redirectTo: '/customers' },
  { path: '**', pathMatch: 'full', redirectTo: '/customers' }
];
