import { Routes } from '@angular/router';
import { UserSettingsComponent } from './user-settings/user-settings.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'customers' },
  { path: 'customers', loadChildren: () => import('./customers/customers.routes').then(m => m.customersRoutes) },
  { path: 'orders/:id', loadChildren: () => import('./orders/orders.routes').then(m => m.ordersRoutes) },
  { path: 'settings', component: UserSettingsComponent }
];
