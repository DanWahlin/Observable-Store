// Deep cloning service supporting plain objects, arrays, Date, RegExp, Map, Set,
// and complex objects (Dayjs, Moment, Luxon, etc.) that would be destroyed by JSON round-trip.
// Based on https://github.com/codeandcats/fast-clone/blob/master/index.js

export class ClonerService {

    deepClone<T>(value: T): T {
        if (value == null || typeof value !== 'object') {
            return value;
        }

        // Cast to work with object types while preserving the return type
        const obj = value as object;

        if (obj instanceof Date) {
            const result = new Date();
            result.setTime(obj.getTime());
            return result as T;
        }

        if (obj instanceof RegExp) {
            return this.cloneRegExp(obj) as T;
        }

        if (obj instanceof Map) {
            const result = new Map();
            obj.forEach((v, k) => {
                result.set(k, this.deepClone(v));
            });
            return result as T;
        }

        if (obj instanceof Set) {
            const result = new Set();
            obj.forEach(v => {
                result.add(this.deepClone(v));
            });
            return result as T;
        }

        // Check if this is a complex object (custom prototype with methods,
        // or toJSON that returns a primitive). These can't survive JSON round-trip.
        if (this.isComplexObject(obj)) {
            return this.cloneComplexValue(obj) as T;
        }

        // Check if this object (or any nested value) contains complex objects.
        // If so, we need to walk the tree manually instead of using JSON.
        if (this.containsComplexValues(obj)) {
            return this.cloneWithComplexObjects(obj) as T;
        }

        // Safe for JSON round-trip
        const result = JSON.parse(JSON.stringify(obj));
        this.fixTypes(obj, result);
        return result;
    }

    /**
     * Determines if a value is a "complex object" — one that would be destroyed
     * by JSON.parse(JSON.stringify()). This includes:
     * - Objects with custom prototypes that have methods (Dayjs, Moment, Luxon, etc.)
     * - Objects whose toJSON() returns a primitive (causes fixTypes crash)
     *
     * Does NOT include: plain objects, arrays, Date, RegExp, Map, Set (handled elsewhere).
     */
    private isComplexObject(value: unknown): boolean {
        if (value == null || typeof value !== 'object') {
            return false;
        }

        if (Array.isArray(value)) {
            return false;
        }

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
        if (typeof (value as { toJSON?: Function }).toJSON === 'function') {
            try {
                const jsonResult = (value as { toJSON: Function }).toJSON();
                if (jsonResult == null || typeof jsonResult !== 'object') {
                    return true; // toJSON returns primitive → would crash fixTypes
                }
            } catch {
                return true; // toJSON throws → not safe
            }
        }

        // Check if prototype has methods beyond constructor
        const protoProps = Object.getOwnPropertyNames(proto);
        for (const prop of protoProps) {
            if (prop !== 'constructor' && typeof proto[prop] === 'function') {
                return true;
            }
        }

        return false;
    }

    /**
     * Recursively checks if an object or array contains any complex objects
     * that can't be JSON-cloned safely.
     */
    private containsComplexValues(value: unknown): boolean {
        if (value == null || typeof value !== 'object') {
            return false;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (item != null && typeof item === 'object') {
                    if (this.isComplexObject(item) || this.containsComplexValues(item)) {
                        return true;
                    }
                }
            }
            return false;
        }

        // Plain object — check all values
        for (const key of Object.getOwnPropertyNames(value)) {
            const child = (value as Record<string, unknown>)[key];
            if (child != null && typeof child === 'object') {
                if (this.isComplexObject(child) || this.containsComplexValues(child)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Clones an object/array that contains complex (non-JSON-safe) values.
     * Walks the tree manually: each child is recursively deep-cloned.
     */
    private cloneWithComplexObjects(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(item => this.deepClone(item));
        }

        const result: Record<string, unknown> = {};
        for (const key of Object.getOwnPropertyNames(value)) {
            result[key] = this.deepClone((value as Record<string, unknown>)[key]);
        }
        return result;
    }

    /**
     * Clones a complex object safely. Strategy (in order):
     * 1. If it has a clone() method (Dayjs, Moment, Luxon all do), use it
     * 2. If the constructor accepts the object, try that
     * 3. Create object with same prototype + copy own properties
     * 4. Fall back to returning the reference (better than crashing)
     */
    private cloneComplexValue(value: object): object {
        const valueWithClone = value as { clone?: () => unknown; constructor?: new (v: unknown) => unknown };

        // Strategy 1: Use clone() if available (Dayjs, Moment, Luxon, etc.)
        if (typeof valueWithClone.clone === 'function') {
            try {
                return valueWithClone.clone() as object;
            } catch {
                // Fall through
            }
        }

        // Strategy 2: Try constructor with the original value
        if (valueWithClone.constructor && valueWithClone.constructor !== Object) {
            try {
                const cloned = new (valueWithClone.constructor as new (v: unknown) => unknown)(value);
                if (cloned != null && typeof cloned === 'object') {
                    return cloned as object;
                }
            } catch {
                // Fall through
            }
        }

        // Strategy 3: Object.create with same prototype + copy own properties
        try {
            const proto = Object.getPrototypeOf(value);
            const cloned = Object.create(proto);
            for (const key of Object.getOwnPropertyNames(value)) {
                const descriptor = Object.getOwnPropertyDescriptor(value, key);
                if (descriptor) {
                    if (descriptor.value != null && typeof descriptor.value === 'object') {
                        descriptor.value = this.deepClone(descriptor.value);
                    }
                    Object.defineProperty(cloned, key, descriptor);
                }
            }
            return cloned;
        } catch {
            // Last resort: return the reference (better than crashing)
            return value;
        }
    }

    /**
     * After JSON.parse(JSON.stringify()), fix types that JSON doesn't preserve:
     * Date, RegExp, Map, Set, NaN, Infinity.
     */
    private fixTypes(original: object, copy: object): void {
        if (Array.isArray(original)) {
            const copyArr = copy as Record<number, unknown>;
            for (let index = 0; index < original.length; index++) {
                this.fixPropertyValue(original as Record<number, unknown>, copyArr, index);
            }
        }
        else {
            for (const key of Object.getOwnPropertyNames(original)) {
                this.fixPropertyValue(
                    original as Record<string, unknown>,
                    copy as Record<string, unknown>,
                    key
                );
            }
        }
    }

    private fixPropertyValue(
        original: Record<string | number, unknown>,
        copy: Record<string | number, unknown>,
        key: string | number
    ): void {
        const originalValue = original[key];

        if (typeof originalValue === 'object') {
            if (originalValue instanceof Date) {
                const newValue = new Date();
                newValue.setTime(originalValue.getTime());
                copy[key] = newValue;
            }
            else if (originalValue instanceof RegExp) {
                copy[key] = this.cloneRegExp(originalValue);
            }
            else if (originalValue instanceof Map || originalValue instanceof Set) {
                copy[key] = this.deepClone(originalValue);
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
                this.fixTypes(originalValue as object, copy[key] as object);
            }
        }
        else if (typeof originalValue === 'number') {
            if (isNaN(originalValue)) {
                copy[key] = NaN;
            }
            else if (originalValue === Infinity) {
                copy[key] = Infinity;
            }
        }
    }

    private cloneRegExp(value: RegExp): RegExp {
        const regexpText = String(value);
        const slashIndex = regexpText.lastIndexOf('/');
        return new RegExp(regexpText.slice(1, slashIndex), regexpText.slice(slashIndex + 1));
    }
}
