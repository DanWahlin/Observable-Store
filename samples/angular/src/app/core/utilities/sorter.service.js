var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
import { PropertyResolver } from './property-resolver';
var SorterService = /** @class */ (function () {
    function SorterService() {
        this.property = null;
        this.direction = 1;
    }
    SorterService.prototype.sort = function (collection, prop) {
        var _this = this;
        this.property = prop;
        this.direction = (this.property === prop) ? this.direction * -1 : 1;
        return collection.sort(function (a, b) {
            var aVal;
            var bVal;
            // Handle resolving complex properties such as 'state.name' for prop value
            if (prop && prop.indexOf('.') > -1) {
                aVal = PropertyResolver.resolve(prop, a);
                bVal = PropertyResolver.resolve(prop, b);
            }
            else {
                aVal = a[prop];
                bVal = b[prop];
            }
            // Fix issues that spaces before/after string value can cause such as ' San Francisco'
            if (_this.isString(aVal)) {
                aVal = aVal.trim().toUpperCase();
            }
            if (_this.isString(bVal)) {
                bVal = bVal.trim().toUpperCase();
            }
            if (aVal === bVal) {
                return 0;
            }
            else if (aVal > bVal) {
                return _this.direction * -1;
            }
            else {
                return _this.direction * 1;
            }
        });
    };
    SorterService.prototype.isString = function (val) {
        return (val && (typeof val === 'string' || val instanceof String));
    };
    SorterService = __decorate([
        Injectable()
    ], SorterService);
    return SorterService;
}());
export { SorterService };
//# sourceMappingURL=sorter.service.js.map