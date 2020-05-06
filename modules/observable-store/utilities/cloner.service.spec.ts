import { ClonerService } from './cloner.service';

class FakeClass {
  constructor(public prop1: string, public prop2: string) {}
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
});
