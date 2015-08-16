var FoodGroup = (function () {
    function FoodGroup() {
    }
    Object.defineProperty(FoodGroup.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (val) {
            this._name = val;
        },
        enumerable: true,
        configurable: true
    });
    return FoodGroup;
})();

//# sourceMappingURL=foodGroup.js.map