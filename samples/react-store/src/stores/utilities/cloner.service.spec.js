Object.defineProperty(exports, "__esModule", { value: true });
var cloner_service_1 = require("./cloner.service");
var FakeClass = /** @class */ (function () {
    function FakeClass(prop1, prop2) {
        this.prop1 = prop1;
        this.prop2 = prop2;
    }
    return FakeClass;
}());
describe('ClonerService', function () {
    it('should clone a class', function () {
        var fake = new FakeClass('foo', 'bar');
        var cloneService = new cloner_service_1.ClonerService();
        var clonedFake = cloneService.deepClone(fake);
        expect(clonedFake.prop1).toEqual('foo');
        expect(clonedFake.prop2).toEqual('bar');
    });
    it('should not be the original class that was cloned', function () {
        var fake = new FakeClass('foo', 'bar');
        var cloneService = new cloner_service_1.ClonerService();
        var clonedFake = cloneService.deepClone(fake);
        expect(fake).toBe(fake);
        expect(clonedFake).not.toBe(fake);
    });
    it('should deep clone an interface', function () {
        var deepWithFakeClass = { prop1: 'test', fake: new FakeClass('foo', 'bar') };
        var clonedObject = new cloner_service_1.ClonerService().deepClone(deepWithFakeClass);
        expect(clonedObject.prop1).toEqual('test');
        expect(clonedObject.fake.prop1).toEqual('foo');
        expect(clonedObject.fake.prop2).toEqual('bar');
    });
});
//# sourceMappingURL=cloner.service.spec.js.map