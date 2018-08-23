var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import { ObservableStore } from '../../../../../src/observable-store';
var CustomersStore = /** @class */ (function (_super) {
    __extends(CustomersStore, _super);
    function CustomersStore(sorterService) {
        var _this = this;
        var customer = {
            id: Date.now(),
            name: 'Jane Doe',
            address: {
                street: '1234 Main St.',
                city: 'Phoenix',
                state: 'AZ',
                zip: '85258'
            }
        };
        _this = _super.call(this, [customer], true) || this;
        _this.sorterService = sorterService;
        return _this;
    }
    CustomersStore.prototype.addCustomer = function (cust) {
        // insert via server API
        // if successful update store state
        var custs = this.getState();
        custs.push(cust);
        this.setState('add', custs);
    };
    CustomersStore.prototype.removeCustomer = function () {
        var custs = this.getState();
        custs.splice(custs.length - 1, 1);
        this.setState('remove', custs);
    };
    CustomersStore.prototype.sortCustomers = function (property) {
        var sortedState = this.sorterService.sort(this.getState(), 'id');
        this.setState('sort', sortedState);
        console.log(this.stateHistory);
    };
    CustomersStore = __decorate([
        Injectable()
    ], CustomersStore);
    return CustomersStore;
}(ObservableStore));
export { CustomersStore };
//# sourceMappingURL=customers.store.js.map