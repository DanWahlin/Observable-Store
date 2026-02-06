import { describe, it, expect } from 'vitest';
import { ClonerService } from './cloner.service';

class FakeClass {
  constructor(public prop1: string, public prop2: string) {}
}

// Simulates Dayjs/Moment: has toJSON(), clone(), and prototype methods
class MockDateLib {
  private _date: Date;

  constructor(dateStr: string | MockDateLib) {
    if (dateStr instanceof MockDateLib) {
      this._date = new Date(dateStr._date.getTime());
    } else {
      this._date = new Date(dateStr);
    }
  }

  format(fmt?: string): string {
    return this._date.toISOString().split('T')[0];
  }

  toJSON(): string {
    return this._date.toISOString();
  }

  clone(): MockDateLib {
    return new MockDateLib(this);
  }

  getTime(): number {
    return this._date.getTime();
  }

  add(days: number): MockDateLib {
    const d = new Date(this._date.getTime());
    d.setDate(d.getDate() + days);
    return new MockDateLib(d.toISOString());
  }
}

// Simulates a mutable complex class WITHOUT clone()
class MutableConfig {
  public settings: Record<string, any> = {};

  constructor(init?: Record<string, any> | MutableConfig) {
    if (init instanceof MutableConfig) {
      this.settings = JSON.parse(JSON.stringify(init.settings));
    } else if (init) {
      this.settings = { ...init };
    }
  }

  get(key: string): any {
    return this.settings[key];
  }

  set(key: string, value: any): void {
    this.settings[key] = value;
  }

  toJSON(): object {
    return { settings: this.settings };
  }
}

// Class with toJSON returning a primitive (the actual Dayjs crash scenario)
class PrimitiveJsonClass {
  private value: number;

  constructor(val: number | PrimitiveJsonClass) {
    if (val instanceof PrimitiveJsonClass) {
      this.value = val.value;
    } else {
      this.value = val;
    }
  }

  toJSON(): number {
    return this.value;
  }

  getValue(): number {
    return this.value;
  }

  clone(): PrimitiveJsonClass {
    return new PrimitiveJsonClass(this.value);
  }
}

// Simple data class with no methods (should still be JSON-cloneable)
class SimpleData {
  constructor(public name: string, public age: number) {}
}

describe('ClonerService', () => {

  // =========================================================================
  // EXISTING TESTS (preserved)
  // =========================================================================

  it('should clone a class', () => {
    const fake = new FakeClass('foo', 'bar');

    const cloneService = new ClonerService();
    const clonedFake = cloneService.deepClone(fake);

    expect(clonedFake.prop1).toEqual('foo');
    expect(clonedFake.prop2).toEqual('bar');
  });

  it('should clone a Map', () => {
    let map = new Map();
    map.set('key', 22);
    const cloneService = new ClonerService();
    const clonedMap = cloneService.deepClone(map);
    expect(map).toBe(map);
    expect(clonedMap).not.toBe(map);
    expect(clonedMap.size).toEqual(map.size);
  });

  it('should deep clone Map values (not share references)', () => {
    const user = { name: 'Dan', address: { city: 'Phoenix' } };
    const map = new Map<string, any>();
    map.set('user1', user);

    const cloneService = new ClonerService();
    const clonedMap = cloneService.deepClone(map);

    // Mutate the cloned value
    clonedMap.get('user1').address.city = 'Seattle';

    // Original should NOT be affected
    expect(user.address.city).toEqual('Phoenix');
    expect(clonedMap.get('user1').address.city).toEqual('Seattle');
  });

  it('should clone a Set', () => {
    let set = new Set();
    set.add('value1');
    set.add('value2');
    const cloneService = new ClonerService();
    const clonedSet = cloneService.deepClone(set);
    expect(set).toBe(set);
    expect(clonedSet).not.toBe(set);
    expect(clonedSet.size).toEqual(set.size);
  });

  it('should deep clone Set entries (not share references)', () => {
    const obj1 = { name: 'first', nested: { value: 1 } };
    const obj2 = { name: 'second', nested: { value: 2 } };
    const set = new Set([obj1, obj2]);

    const cloneService = new ClonerService();
    const clonedSet = cloneService.deepClone(set);

    // Get the first entry from the cloned set and mutate it
    const clonedEntries = [...clonedSet];
    clonedEntries[0].nested.value = 999;

    // Original should NOT be affected
    expect(obj1.nested.value).toEqual(1);
    expect(clonedEntries[0].nested.value).toEqual(999);
  });

  it('should not be the original class that was cloned', () => {
    const fake = new FakeClass('foo', 'bar');

    const cloneService = new ClonerService();
    const clonedFake = cloneService.deepClone(fake);

    expect(fake).toBe(fake);
    expect(clonedFake).not.toBe(fake);
  });

  interface DeepWithFakeClass {
    prop1: string;
    fake: FakeClass;
  }

  it('should deep clone an interface', () => {
    const deepWithFakeClass: DeepWithFakeClass = { prop1: 'test', fake: new FakeClass('foo', 'bar') };

    const clonedObject = new ClonerService().deepClone(deepWithFakeClass);

    expect(clonedObject.prop1).toEqual('test');
    expect(clonedObject.fake.prop1).toEqual('foo');
    expect(clonedObject.fake.prop2).toEqual('bar');
  });

  // =========================================================================
  // COMPLEX OBJECT TESTS (Issue #314)
  // =========================================================================

  describe('Complex objects (Dayjs/Moment-like)', () => {

    it('should clone objects containing date-lib instances without crashing', () => {
      const testObject = {
        name: 'Test',
        createdAt: new MockDateLib('2019-12-31'),
        nested: {
          updatedAt: new MockDateLib('2020-06-15')
        }
      };

      const cloneService = new ClonerService();
      // This was the crash: TypeError: Cannot create property '$d' on string
      expect(() => cloneService.deepClone(testObject)).not.toThrow();
    });

    it('should produce a separate clone (not the same reference) for the top-level object', () => {
      const testObject = {
        name: 'Test',
        createdAt: new MockDateLib('2019-12-31')
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned).not.toBe(testObject);
      expect(cloned.name).toEqual('Test');
    });

    it('should clone date-lib instances as separate objects (not shared references)', () => {
      const original = new MockDateLib('2020-01-01');
      const testObject = { date: original };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      // The cloned date should NOT be the same reference (avoids mutation footgun)
      expect(cloned.date).not.toBe(original);
      // But should have the same value
      expect(cloned.date.format()).toEqual('2020-01-01');
      expect(cloned.date.getTime()).toEqual(original.getTime());
    });

    it('should preserve prototype methods on cloned complex objects', () => {
      const testObject = {
        date: new MockDateLib('2020-01-01')
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      // Methods should still work
      expect(typeof cloned.date.format).toBe('function');
      expect(typeof cloned.date.add).toBe('function');
      expect(typeof cloned.date.clone).toBe('function');
      expect(cloned.date.format()).toEqual('2020-01-01');
    });

    it('should handle nested complex objects', () => {
      const testObject = {
        user: 'John',
        metadata: {
          createdAt: new MockDateLib('2020-01-01'),
          config: {
            updatedAt: new MockDateLib('2021-06-15')
          }
        }
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned).not.toBe(testObject);
      expect(cloned.metadata).not.toBe(testObject.metadata);
      expect(cloned.metadata.config).not.toBe(testObject.metadata.config);
      expect(cloned.user).toEqual('John');
      expect(cloned.metadata.createdAt.format()).toEqual('2020-01-01');
      expect(cloned.metadata.config.updatedAt.format()).toEqual('2021-06-15');
    });

    it('should handle objects with toJSON returning primitives (the actual crash case)', () => {
      const testObject = {
        name: 'Test',
        value: new PrimitiveJsonClass(42)
      };

      const cloneService = new ClonerService();
      // This was crashing: JSON.stringify converts to 42, then fixTypes tries
      // to set properties on a number
      expect(() => cloneService.deepClone(testObject)).not.toThrow();

      const cloned = cloneService.deepClone(testObject);
      expect(cloned.name).toEqual('Test');
      expect(cloned.value.getValue()).toEqual(42);
    });
  });

  // =========================================================================
  // ARRAYS WITH COMPLEX OBJECTS
  // =========================================================================

  describe('Arrays containing complex objects', () => {

    it('should handle arrays of date-lib instances', () => {
      const dates = [
        new MockDateLib('2020-01-01'),
        new MockDateLib('2020-06-15'),
        new MockDateLib('2020-12-31')
      ];

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(dates);

      expect(cloned).not.toBe(dates);
      expect(cloned.length).toEqual(3);
      expect(cloned[0]).not.toBe(dates[0]);
      expect(cloned[0].format()).toEqual('2020-01-01');
      expect(cloned[1].format()).toEqual('2020-06-15');
      expect(cloned[2].format()).toEqual('2020-12-31');
    });

    it('should handle state objects with array of complex objects', () => {
      const testObject = {
        name: 'Timeline',
        events: [
          { label: 'Start', date: new MockDateLib('2020-01-01') },
          { label: 'End', date: new MockDateLib('2020-12-31') }
        ]
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned).not.toBe(testObject);
      expect(cloned.events).not.toBe(testObject.events);
      expect(cloned.events.length).toEqual(2);
      expect(cloned.events[0].label).toEqual('Start');
      expect(cloned.events[0].date.format()).toEqual('2020-01-01');
      expect(cloned.events[1].date.format()).toEqual('2020-12-31');
      // Not shared references
      expect(cloned.events[0].date).not.toBe(testObject.events[0].date);
    });

    it('should handle mixed arrays with primitives and complex objects', () => {
      const testObject = {
        items: [1, 'hello', new MockDateLib('2020-01-01'), null, { nested: true }]
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned.items[0]).toEqual(1);
      expect(cloned.items[1]).toEqual('hello');
      expect(cloned.items[2].format()).toEqual('2020-01-01');
      expect(cloned.items[3]).toBeNull();
      expect(cloned.items[4].nested).toEqual(true);
    });
  });

  // =========================================================================
  // MUTATION ISOLATION (the "footgun" test)
  // =========================================================================

  describe('Mutation isolation', () => {

    it('should not affect original when cloned complex object is mutated', () => {
      const config = new MutableConfig({ theme: 'dark', lang: 'en' });
      const testObject = { config: config };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      // Mutate the clone
      cloned.config.set('theme', 'light');

      // Original should not be affected
      expect(testObject.config.get('theme')).toEqual('dark');
      expect(cloned.config.get('theme')).toEqual('light');
    });

    it('should not affect original plain objects when clone is mutated', () => {
      const testObject = {
        user: { name: 'Dan', age: 30 },
        settings: { theme: 'dark' }
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      cloned.user.name = 'Changed';
      cloned.settings.theme = 'light';

      expect(testObject.user.name).toEqual('Dan');
      expect(testObject.settings.theme).toEqual('dark');
    });
  });

  // =========================================================================
  // MIXED SCENARIOS
  // =========================================================================

  describe('Mixed object types', () => {

    it('should handle objects with Date, complex, Map, Set, and plain values', () => {
      const testObject = {
        name: 'Complex State',
        regularDate: new Date('2020-01-01'),
        libDate: new MockDateLib('2020-06-15'),
        tags: new Set(['a', 'b']),
        metadata: new Map([['key', 'value']]),
        settings: { theme: 'dark', count: 42 },
        items: [1, 2, 3]
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned).not.toBe(testObject);
      expect(cloned.name).toEqual('Complex State');

      // Date: properly cloned
      expect(cloned.regularDate).not.toBe(testObject.regularDate);
      expect(cloned.regularDate.getTime()).toEqual(testObject.regularDate.getTime());

      // Complex object: cloned with methods intact
      expect(cloned.libDate).not.toBe(testObject.libDate);
      expect(cloned.libDate.format()).toEqual('2020-06-15');

      // Set: cloned
      expect(cloned.tags).not.toBe(testObject.tags);
      expect(cloned.tags.size).toEqual(2);

      // Map: cloned
      expect(cloned.metadata).not.toBe(testObject.metadata);
      expect(cloned.metadata.get('key')).toEqual('value');

      // Plain object: deep cloned
      expect(cloned.settings).not.toBe(testObject.settings);
      expect(cloned.settings.theme).toEqual('dark');

      // Array: deep cloned
      expect(cloned.items).not.toBe(testObject.items);
      expect(cloned.items).toEqual([1, 2, 3]);
    });

    it('should handle null and undefined values alongside complex objects', () => {
      const testObject = {
        date: new MockDateLib('2020-01-01'),
        nullVal: null,
        undefinedVal: undefined,
        emptyStr: '',
        zero: 0
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned.date.format()).toEqual('2020-01-01');
      expect(cloned.nullVal).toBeNull();
      expect(cloned.undefinedVal).toBeUndefined();
      expect(cloned.emptyStr).toEqual('');
      expect(cloned.zero).toEqual(0);
    });
  });

  // =========================================================================
  // EDGE CASES
  // =========================================================================

  describe('Edge cases', () => {

    it('should still handle NaN and Infinity in plain objects', () => {
      const testObject = {
        nan: NaN,
        inf: Infinity,
        normal: 42
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(isNaN(cloned.nan)).toBe(true);
      expect(cloned.inf).toEqual(Infinity);
      expect(cloned.normal).toEqual(42);
    });

    it('should handle empty objects and arrays', () => {
      const testObject = {
        empty: {},
        emptyArr: [],
        emptyNested: { inner: {} }
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned).not.toBe(testObject);
      expect(cloned.empty).not.toBe(testObject.empty);
      expect(cloned.emptyArr).not.toBe(testObject.emptyArr);
      expect(cloned.emptyArr.length).toEqual(0);
    });

    it('should handle a top-level complex object (not wrapped in plain object)', () => {
      const date = new MockDateLib('2020-01-01');

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(date);

      expect(cloned).not.toBe(date);
      expect(cloned.format()).toEqual('2020-01-01');
      expect(cloned.getTime()).toEqual(date.getTime());
    });

    it('should handle deeply nested complex objects (3+ levels)', () => {
      const testObject = {
        level1: {
          level2: {
            level3: {
              date: new MockDateLib('2020-01-01'),
              value: 'deep'
            }
          }
        }
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned.level1.level2.level3.value).toEqual('deep');
      expect(cloned.level1.level2.level3.date.format()).toEqual('2020-01-01');
      expect(cloned.level1.level2.level3.date).not.toBe(
        testObject.level1.level2.level3.date
      );
    });

    it('should clone primitive values as-is', () => {
      const cloneService = new ClonerService();
      expect(cloneService.deepClone(42)).toEqual(42);
      expect(cloneService.deepClone('hello')).toEqual('hello');
      expect(cloneService.deepClone(true)).toEqual(true);
      expect(cloneService.deepClone(null)).toBeNull();
      expect(cloneService.deepClone(undefined)).toBeUndefined();
    });

    it('should clone a Date object', () => {
      const original = new Date('2020-06-15T12:00:00Z');
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(original);

      expect(cloned).not.toBe(original);
      expect(cloned instanceof Date).toBe(true);
      expect(cloned.getTime()).toEqual(original.getTime());
    });

    it('should clone a RegExp object', () => {
      const original = /test-pattern/gi;
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(original);

      expect(cloned).not.toBe(original);
      expect(cloned instanceof RegExp).toBe(true);
      expect(cloned.source).toEqual('test-pattern');
      expect(cloned.flags).toEqual('gi');
    });

    it('should handle objects with getter properties', () => {
      const obj = {
        _name: 'Dan',
        get name() { return this._name.toUpperCase(); }
      };

      const cloneService = new ClonerService();
      // JSON.parse/stringify will evaluate the getter and clone its value
      const cloned = cloneService.deepClone(obj);
      expect(cloned._name).toEqual('Dan');
      expect(cloned.name).toEqual('DAN');
    });

    it('should handle Uint8Array by returning a clone', () => {
      const arr = new Uint8Array([1, 2, 3, 4]);
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(arr);

      // Typed arrays have custom prototypes, so cloner will use complex path
      expect(cloned).not.toBe(arr);
    });

    it('should handle objects with NaN values inside arrays', () => {
      const testObject = {
        values: [1, NaN, 3, Infinity, null]
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned.values[0]).toEqual(1);
      expect(isNaN(cloned.values[1])).toBe(true);
      expect(cloned.values[2]).toEqual(3);
      expect(cloned.values[3]).toEqual(Infinity);
      expect(cloned.values[4]).toBeNull();
    });

    it('should handle nested Date objects inside arrays', () => {
      const d1 = new Date('2020-01-01');
      const d2 = new Date('2021-06-15');
      const testObject = {
        dates: [d1, d2]
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned.dates[0]).not.toBe(d1);
      expect(cloned.dates[0].getTime()).toEqual(d1.getTime());
      expect(cloned.dates[1]).not.toBe(d2);
      expect(cloned.dates[1].getTime()).toEqual(d2.getTime());
    });

    it('should handle nested RegExp objects inside plain objects', () => {
      const testObject = {
        patterns: {
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          phone: /^\d{3}-\d{3}-\d{4}$/
        }
      };

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(testObject);

      expect(cloned.patterns.email).not.toBe(testObject.patterns.email);
      expect(cloned.patterns.email.source).toEqual(testObject.patterns.email.source);
      expect(cloned.patterns.phone.source).toEqual(testObject.patterns.phone.source);
    });

    it('should handle Map with complex object values', () => {
      const map = new Map<string, any>();
      map.set('created', new MockDateLib('2020-01-01'));
      map.set('updated', new MockDateLib('2021-06-15'));

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(map);

      expect(cloned).not.toBe(map);
      expect(cloned.get('created')).not.toBe(map.get('created'));
      expect(cloned.get('created').format()).toEqual('2020-01-01');
      expect(cloned.get('updated').format()).toEqual('2021-06-15');
    });

    it('should handle Set with complex object values', () => {
      const set = new Set<any>();
      set.add(new MockDateLib('2020-01-01'));
      set.add(new MockDateLib('2021-06-15'));

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(set);

      expect(cloned).not.toBe(set);
      expect(cloned.size).toEqual(2);
      const clonedArr = [...cloned];
      const origArr = [...set];
      expect(clonedArr[0]).not.toBe(origArr[0]);
      expect(clonedArr[0].format()).toEqual('2020-01-01');
    });

    it('should handle a complex object without clone() method', () => {
      const config = new MutableConfig({ theme: 'dark' });

      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(config);

      expect(cloned).not.toBe(config);
      expect(cloned.get('theme')).toEqual('dark');
      // Verify it has prototype methods
      expect(typeof cloned.set).toBe('function');
      expect(typeof cloned.get).toBe('function');
    });

    it('should handle an empty Map', () => {
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(new Map());
      expect(cloned instanceof Map).toBe(true);
      expect(cloned.size).toEqual(0);
    });

    it('should handle an empty Set', () => {
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(new Set());
      expect(cloned instanceof Set).toBe(true);
      expect(cloned.size).toEqual(0);
    });

    it('should handle a plain array of primitives', () => {
      const arr = [1, 'two', true, null];
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(arr);

      expect(cloned).not.toBe(arr);
      expect(cloned).toEqual([1, 'two', true, null]);
    });

    it('should handle a deeply nested plain object', () => {
      const obj = { a: { b: { c: { d: { e: 'deep' } } } } };
      const cloneService = new ClonerService();
      const cloned = cloneService.deepClone(obj);

      expect(cloned).not.toBe(obj);
      expect(cloned.a.b.c.d.e).toEqual('deep');
      cloned.a.b.c.d.e = 'mutated';
      expect(obj.a.b.c.d.e).toEqual('deep');
    });
  });
});
