// https://github.com/NetanelBasal/ngx-auto-unsubscribe/blob/master/src/auto-unsubscribe.ts
var isFunction = function (fn) { return typeof fn === 'function'; };
var doUnsubscribe = function (subscription) {
    subscription && isFunction(subscription.unsubscribe) && subscription.unsubscribe();
};
var doUnsubscribeIfArray = function (subscriptionsArray) {
    Array.isArray(subscriptionsArray) && subscriptionsArray.forEach(doUnsubscribe);
};
export function AutoUnsubscribe(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.blackList, blackList = _c === void 0 ? [] : _c, _d = _b.includeArrays, includeArrays = _d === void 0 ? false : _d, _e = _b.arrayName, arrayName = _e === void 0 ? '' : _e, _f = _b.event, event = _f === void 0 ? 'ngOnDestroy' : _f;
    return function (constructor) {
        var original = constructor.prototype[event];
        if (!isFunction(original) && !disableAutoUnsubscribeAot()) {
            console.warn(constructor.name + " is using @AutoUnsubscribe but does not implement OnDestroy");
        }
        constructor.prototype[event] = function () {
            if (arrayName) {
                return doUnsubscribeIfArray(this[arrayName]);
            }
            for (var propName in this) {
                if (blackList.includes(propName))
                    continue;
                var property = this[propName];
                doUnsubscribe(property);
                doUnsubscribeIfArray(property);
            }
            isFunction(original) && original.apply(this, arguments);
        };
    };
    function disableAutoUnsubscribeAot() {
        return window && window['disableAutoUnsubscribeAot'] || window['disableAuthUnsubscribeAot'];
    }
}
//# sourceMappingURL=auto-unsubscribe.decorator.js.map