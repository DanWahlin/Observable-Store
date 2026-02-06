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

                // Check if this is a complex object (custom prototype with methods,
                // or toJSON that returns a primitive). These can't survive JSON round-trip.
                if (this.isComplexObject(value)) {
                    return this.cloneComplexValue(value);
                }

                // Check if this object (or any nested value) contains complex objects.
                // If so, we need to walk the tree manually instead of using JSON.
                if (this.containsComplexValues(value)) {
                    return this.cloneWithComplexObjects(value);
                }

                // Safe for JSON round-trip
                result = JSON.parse(JSON.stringify(value));
                this.fixTypes(value, result);
                return result;

            default:
                return value;
        }
    }

    /**
     * Determines if a value is a "complex object" — one that would be destroyed
     * by JSON.parse(JSON.stringify()). This includes:
     * - Objects with custom prototypes that have methods (Dayjs, Moment, Luxon, etc.)
     * - Objects whose toJSON() returns a primitive (causes fixTypes crash)
     * 
     * Does NOT include: plain objects, arrays, Date, RegExp, Map, Set (handled elsewhere).
     */
    private isComplexObject(value: any): boolean {
        if (value == null || typeof value !== 'object') {
            return false;
        }

        // Arrays are not complex objects (they're handled separately)
        if (Array.isArray(value)) {
            return false;
        }

        // Already-handled types
        if (value instanceof Date || value instanceof RegExp ||
            value instanceof Map || value instanceof Set) {
            return false;
        }

        const proto = Object.getPrototypeOf(value);

        // Plain objects (no custom prototype) are safe
        if (proto === Object.prototype || proto === null) {
            return false;
        }

        // Has custom prototype — check for toJSON that returns primitive
        if (typeof value.toJSON === 'function') {
            try {
                const jsonResult = value.toJSON();
                if (jsonResult == null || typeof jsonResult !== 'object') {
                    return true; // toJSON returns primitive → would crash fixTypes
                }
            } catch (e) {
                return true; // toJSON throws → not safe
            }
        }

        // Check if prototype has methods beyond constructor
        const protoProps = Object.getOwnPropertyNames(proto);
        for (const prop of protoProps) {
            if (prop !== 'constructor' && typeof proto[prop] === 'function') {
                return true; // Has methods → complex object
            }
        }

        return false;
    }

    /**
     * Recursively checks if an object or array contains any complex objects
     * that can't be JSON-cloned safely.
     */
    private containsComplexValues(value: any): boolean {
        if (value == null || typeof value !== 'object') {
            return false;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item != null && typeof item === 'object') {
                    if (this.isComplexObject(item)) {
                        return true;
                    }
                    if (this.containsComplexValues(item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Plain object — check all values
        const keys = Object.getOwnPropertyNames(value);
        for (const key of keys) {
            const child = value[key];
            if (child != null && typeof child === 'object') {
                if (this.isComplexObject(child)) {
                    return true;
                }
                if (this.containsComplexValues(child)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Clones an object/array that contains complex (non-JSON-safe) values.
     * Walks the tree manually: plain sub-objects are deep-cloned via JSON;
     * complex objects use cloneComplexValue(); known types use deepClone().
     */
    private cloneWithComplexObjects(value: any): any {
        if (Array.isArray(value)) {
            return value.map(item => this.deepClone(item));
        }

        const result: any = {};
        const keys = Object.getOwnPropertyNames(value);

        for (const key of keys) {
            result[key] = this.deepClone(value[key]);
        }

        return result;
    }

    /**
     * Clones a complex object safely. Strategy (in order):
     * 1. If it has a clone() method (Dayjs, Moment, Luxon all do), use it
     * 2. If the constructor accepts the object, try that
     * 3. Create object with same prototype + copy own properties
     * 4. Fall back to returning the reference (better than crashing)
     * 
     * This avoids shared mutable references (the "footgun") while still
     * handling objects that JSON.stringify would destroy.
     */
    private cloneComplexValue(value: any): any {
        // Strategy 1: Use clone() if available (Dayjs, Moment, Luxon, etc.)
        if (typeof value.clone === 'function') {
            try {
                return value.clone();
            } catch (e) {
                // Fall through
            }
        }

        // Strategy 2: Try constructor with the original value
        if (value.constructor && value.constructor !== Object) {
            try {
                const cloned = new value.constructor(value);
                if (cloned != null && typeof cloned === 'object') {
                    return cloned;
                }
            } catch (e) {
                // Fall through
            }
        }

        // Strategy 3: Object.create with same prototype + copy own properties
        try {
            const proto = Object.getPrototypeOf(value);
            const cloned = Object.create(proto);
            const keys = Object.getOwnPropertyNames(value);
            for (const key of keys) {
                const descriptor = Object.getOwnPropertyDescriptor(value, key);
                if (descriptor) {
                    if (descriptor.value != null && typeof descriptor.value === 'object') {
                        descriptor.value = this.deepClone(descriptor.value);
                    }
                    Object.defineProperty(cloned, key, descriptor);
                }
            }
            return cloned;
        } catch (e) {
            // Last resort: return the reference (better than crashing)
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
                else if (typeof copy[key] !== 'object' || copy[key] === null) {
                    // Safety guard: if JSON.stringify converted this to a primitive,
                    // don't try to recurse into it — re-clone properly instead.
                    copy[key] = this.deepClone(originalValue);
                }
                else {
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

}
