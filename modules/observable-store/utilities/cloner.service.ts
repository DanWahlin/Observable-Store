// https://github.com/codeandcats/fast-clone/blob/master/index.js

export class ClonerService {

    deepClone(value) {
        const type = typeof value;
        switch (type) {
            case 'object':
                // null and undefined
                if (value == null) {
                    return value;
                }

                let result;

                if (value instanceof Date) {
                    result = new Date();
                    result.setTime(value.getTime());
                    return result;
                }
                else if (value instanceof RegExp) {
                    result = this.newRegExp(value);
                    return result;
                }
                else if (value instanceof Map) {
                    result = new Map(value);
                    return result;
                }
                else if (value instanceof Set) {
                    result = new Set(value);
                    return result;
                }

                // Check if this is a plain object or array that can be safely JSON-cloned
                // For complex objects with custom prototypes (like Dayjs, Moment, etc.),
                // return the original reference to avoid cloning issues
                if (!this.isCloneable(value)) {
                    return value;
                }

                result = JSON.parse(JSON.stringify(value));
                this.fixTypes(value, result);
                return result;

            default:
                return value;
        }
    }

    private fixPropertyValue(original, copy, key) {
        const originalValue = original[key];
        const originalType = typeof originalValue;

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
                else if (originalValue instanceof Map) {
                    copy[key] = new Map(originalValue);
                }
                else if (originalValue instanceof Set) {
                    copy[key] = new Set(originalValue);
                }
                else if (originalValue == null) {
                    copy[key] = originalValue;
                }
                else if (!this.isCloneable(originalValue)) {
                    // For complex objects with custom prototypes (Dayjs, Moment, etc.),
                    // use the original reference to avoid cloning issues
                    copy[key] = originalValue;
                }
                else if (typeof copy[key] === 'object' && copy[key] !== null) {
                    // Only call fixTypes if copy[key] is still an object
                    // (not converted to a string/primitive by JSON.stringify)
                    this.fixTypes(originalValue, copy[key]);
                }
                break;

            case 'number':
                if (isNaN(originalValue)) {
                    copy[key] = NaN;
                }
                else if (originalValue == Infinity) {
                    copy[key] = Infinity;
                }
                break;

            default:
                break;
        }
    }

    private fixTypes(original, copy) {
        if (original instanceof Array) {
            for (let index = 0; index < original.length; index++) {
                this.fixPropertyValue(original, copy, index);
            }
        }
        else {
            let keys = Object.getOwnPropertyNames(original);
            keys.forEach(key => {
                this.fixPropertyValue(original, copy, key);
            });
        }
    }

    private newRegExp(value) {
        const regexpText = String(value);
        const slashIndex = regexpText.lastIndexOf('/');
        return new RegExp(regexpText.slice(1, slashIndex), regexpText.slice(slashIndex + 1));
    }

    private isCloneable(value): boolean {
        // Arrays are always cloneable
        if (value instanceof Array) {
            return true;
        }

        // Check if it's a plain object (created by {} or new Object())
        const proto = Object.getPrototypeOf(value);
        if (proto === Object.prototype || proto === null) {
            return true;
        }

        // If the object has a toJSON method, check if it would convert to a primitive
        // This handles Dayjs, Moment, and other objects with custom JSON serialization
        if (typeof value.toJSON === 'function') {
            try {
                const jsonResult = value.toJSON();
                const jsonType = typeof jsonResult;
                // If toJSON returns a primitive (string, number, etc.), it's not safely cloneable
                if (jsonType !== 'object' || jsonResult === null) {
                    return false;
                }
            } catch (e) {
                // If toJSON throws, treat as not cloneable
                return false;
            }
        }

        // Check if the prototype has methods beyond constructor
        // Objects with methods are complex and shouldn't be cloned via JSON
        const protoProps = Object.getOwnPropertyNames(proto);
        const hasMethods = protoProps.some(prop => {
            return prop !== 'constructor' && typeof value[prop] === 'function';
        });
        
        if (hasMethods) {
            return false;
        }

        // Simple data classes (only properties, no methods) are cloneable
        return true;
    }

}
