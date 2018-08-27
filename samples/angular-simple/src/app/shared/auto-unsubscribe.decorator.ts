// https://github.com/NetanelBasal/ngx-auto-unsubscribe/blob/master/src/auto-unsubscribe.ts
const isFunction = (fn) => typeof fn === 'function';

const doUnsubscribe = (subscription) => {
  subscription && isFunction(subscription.unsubscribe) && subscription.unsubscribe();
}

const doUnsubscribeIfArray = (subscriptionsArray) => {
  Array.isArray(subscriptionsArray) && subscriptionsArray.forEach(doUnsubscribe);
}

export function AutoUnsubscribe({ blackList = [], includeArrays = false, arrayName = '', event = 'ngOnDestroy'} = {}) {

  return function (constructor: Function) {
    const original = constructor.prototype[event];

    if (!isFunction(original) && !disableAutoUnsubscribeAot()) {
      console.warn(`${constructor.name} is using @AutoUnsubscribe but does not implement OnDestroy`);
    }

    constructor.prototype[event] = function () {
      if (arrayName) {
        return doUnsubscribeIfArray(this[arrayName]);
      }

      for (let propName in this) {
        if (blackList.includes(propName)) continue;

        const property = this[propName];
        doUnsubscribe(property);
        doUnsubscribeIfArray(property);
      }

      isFunction(original) && original.apply(this, arguments);
    };
  }


  function disableAutoUnsubscribeAot() {
    return window && window['disableAutoUnsubscribeAot'] || window['disableAuthUnsubscribeAot'];
  }
}