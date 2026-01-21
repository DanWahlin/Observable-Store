import { ClonerService } from './cloner.service';
import dayjs from 'dayjs';

class FakeClass {
  constructor(public prop1: string, public prop2: string) {}
}

// Mock complex class similar to Dayjs/Moment with toJSON method
class ComplexDateClass {
  private internalDate: Date;
  
  constructor(dateStr: string) {
    this.internalDate = new Date(dateStr);
  }
  
  format(formatStr: string): string {
    return this.internalDate.toISOString();
  }
  
  toJSON(): string {
    return this.internalDate.toISOString();
  }
  
  getTime(): number {
    return this.internalDate.getTime();
  }
}

describe('ClonerService', () => {
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
    expect (clonedMap.size).toEqual(map.size);
  });

  it('should clone a Set', () => {
    let set = new Set();
    set.add('value1');
    set.add('value2');
    const cloneService = new ClonerService();
    const clonedSet = cloneService.deepClone(set);
    expect(set).toBe(set);
    expect(clonedSet).not.toBe(set);
    expect (clonedSet.size).toEqual(clonedSet.size);
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

  it('should handle Dayjs objects by returning reference', () => {
    const testObject = {
      name: 'Test',
      date: dayjs('2019-12-31'),
      nested: {
        anotherDate: dayjs('2020-01-01')
      }
    };

    const cloneService = new ClonerService();
    const clonedObject = cloneService.deepClone(testObject);

    // The object structure is cloned
    expect(clonedObject).not.toBe(testObject);
    expect(clonedObject.name).toEqual('Test');
    expect(clonedObject.nested).not.toBe(testObject.nested);

    // But Dayjs instances should be the same reference (not cloned)
    expect(clonedObject.date).toBe(testObject.date);
    expect(clonedObject.nested.anotherDate).toBe(testObject.nested.anotherDate);
    
    // And they should still work as Dayjs objects
    expect(clonedObject.date.format('YYYY-MM-DD')).toEqual('2019-12-31');
    expect(clonedObject.nested.anotherDate.format('YYYY-MM-DD')).toEqual('2020-01-01');
  });

  it('should handle custom complex objects with toJSON method', () => {
    const complexObj = new ComplexDateClass('2019-12-31');
    const testObject = {
      name: 'Test',
      complexDate: complexObj
    };

    const cloneService = new ClonerService();
    const clonedObject = cloneService.deepClone(testObject);

    // The object structure is cloned
    expect(clonedObject).not.toBe(testObject);
    expect(clonedObject.name).toEqual('Test');

    // But the complex object should be the same reference
    expect(clonedObject.complexDate).toBe(testObject.complexDate);
    
    // And it should still have its methods
    expect(clonedObject.complexDate.format).toBeDefined();
    expect(clonedObject.complexDate.getTime()).toEqual(new Date('2019-12-31').getTime());
  });

  it('should clone plain objects deeply', () => {
    const plainObject = {
      name: 'Test',
      nested: {
        value: 123,
        deep: {
          items: [1, 2, 3]
        }
      }
    };

    const cloneService = new ClonerService();
    const clonedObject = cloneService.deepClone(plainObject);

    // Everything should be cloned
    expect(clonedObject).not.toBe(plainObject);
    expect(clonedObject.nested).not.toBe(plainObject.nested);
    expect(clonedObject.nested.deep).not.toBe(plainObject.nested.deep);
    expect(clonedObject.nested.deep.items).not.toBe(plainObject.nested.deep.items);

    // But values should be equal
    expect(clonedObject.name).toEqual('Test');
    expect(clonedObject.nested.value).toEqual(123);
    expect(clonedObject.nested.deep.items).toEqual([1, 2, 3]);
  });

  it('should handle mixed objects with dates and complex objects', () => {
    const testObject = {
      name: 'Test',
      regularDate: new Date('2019-12-31'),
      dayjsDate: dayjs('2020-01-01'),
      nested: {
        complexDate: new ComplexDateClass('2021-01-01')
      }
    };

    const cloneService = new ClonerService();
    const clonedObject = cloneService.deepClone(testObject);

    // Regular dates should be cloned
    expect(clonedObject.regularDate).not.toBe(testObject.regularDate);
    expect(clonedObject.regularDate.getTime()).toEqual(testObject.regularDate.getTime());

    // Dayjs objects should be same reference
    expect(clonedObject.dayjsDate).toBe(testObject.dayjsDate);
    expect(clonedObject.dayjsDate.format('YYYY-MM-DD')).toEqual('2020-01-01');

    // Complex objects should be same reference
    expect(clonedObject.nested.complexDate).toBe(testObject.nested.complexDate);
    expect(clonedObject.nested.complexDate.format).toBeDefined();
  });
});
