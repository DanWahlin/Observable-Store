var PropertyResolver = /** @class */ (function () {
    function PropertyResolver() {
    }
    PropertyResolver.resolve = function (path, obj) {
        return path.split('.').reduce(function (prev, curr) {
            return (prev ? prev[curr] : undefined);
        }, obj || self);
    };
    return PropertyResolver;
}());
export { PropertyResolver };
//# sourceMappingURL=property-resolver.js.map