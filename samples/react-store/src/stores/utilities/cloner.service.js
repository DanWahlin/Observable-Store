// https://github.com/codeandcats/fast-clone/blob/master/index.js
var ClonerService = /** @class */ (function () {
    function ClonerService() {
    }
    ClonerService.prototype.deepClone = function (value) {
        var type = typeof value;
        switch (type) {
            case 'object':
                // null and undefined
                if (value == null) {
                    return value;
                }
                var result = void 0;
                if (value instanceof Date) {
                    result = new Date();
                    result.setTime(value.getTime());
                    return result;
                }
                else if (value instanceof RegExp) {
                    result = this.newRegExp(value);
                    return result;
                }
                result = JSON.parse(JSON.stringify(value));
                this.fixTypes(value, result);
                return result;
            default:
                return value;
        }
    };
    ClonerService.prototype.fixPropertyValue = function (original, copy, key) {
        var originalValue = original[key];
        var originalType = typeof originalValue;
        switch (originalType) {
            case 'object':
                if (originalValue instanceof Date) {
                    var newValue = new Date();
                    newValue.setTime(originalValue.getTime());
                    copy[key] = newValue;
                }
                else if (originalValue instanceof RegExp) {
                    copy[key] = this.newRegExp(originalValue);
                }
                else if (originalValue == null) {
                    copy[key] = originalValue;
                }
                else {
                    this.fixTypes(originalValue, copy[key]);
                }
                break;
            case 'number':
                if (isNaN(originalValue)) {
                    copy[key] = NaN;
                }
                else if (originalValue === Infinity) {
                    copy[key] = Infinity;
                }
                break;
            default:
                break;
        }
    };
    ClonerService.prototype.fixTypes = function (original, copy) {
        var _this = this;
        if (original instanceof Array) {
            for (var index = 0; index < original.length; index++) {
                this.fixPropertyValue(original, copy, index);
            }
        }
        else {
            var keys = Object.getOwnPropertyNames(original);
            keys.forEach(function (key) {
                _this.fixPropertyValue(original, copy, key);
            });
        }
    };
    ClonerService.prototype.newRegExp = function (value) {
        var regexpText = String(value);
        var slashIndex = regexpText.lastIndexOf('/');
        return new RegExp(regexpText.slice(1, slashIndex), regexpText.slice(slashIndex + 1));
    };
    return ClonerService;
}());
export { ClonerService };
//# sourceMappingURL=cloner.service.js.map