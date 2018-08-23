var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component } from '@angular/core';
import { AutoUnsubscribe } from './shared/auto-unsubscribe.decorator';
var AppComponent = /** @class */ (function () {
    function AppComponent(customersStore) {
        this.customersStore = customersStore;
    }
    AppComponent.prototype.ngOnInit = function () {
        // Use Observable<Customer> if desired
        // this.customers = this.customersService.storeStateChanged;
        var _this = this;
        this.customersStore.stateChanged.subscribe(function (custs) {
            _this.customers = custs;
        });
    };
    AppComponent.prototype.addCustomer = function () {
        var cust = {
            id: Date.now(),
            name: 'Fred',
            address: {
                street: Date.now() + ' Main St.',
                city: 'Phoenix',
                state: 'AZ',
                zip: '85258'
            }
        };
        this.customersStore.addCustomer(cust);
    };
    AppComponent.prototype.removeCustomer = function () {
        this.customersStore.removeCustomer();
    };
    AppComponent.prototype.sortCustomers = function () {
        this.customersStore.sortCustomers('id');
    };
    AppComponent.prototype.ngOnDestroy = function () {
    };
    AppComponent = __decorate([
        AutoUnsubscribe(),
        Component({
            selector: 'app-root',
            templateUrl: './app.component.html',
            styleUrls: ['./app.component.css']
        })
    ], AppComponent);
    return AppComponent;
}());
export { AppComponent };
//# sourceMappingURL=app.component.js.map