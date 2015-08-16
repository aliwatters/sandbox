var BaseRecipeCategory = (function () {
    function BaseRecipeCategory() {
        this._foodGroups = [];
    }
    Object.defineProperty(BaseRecipeCategory.prototype, "name", {
        //TODO: Create get and set blocks for each of the variables in the declaration above.
        get: function () { },
        set: function () { },
        enumerable: true,
        configurable: true
    });
    BaseRecipeCategory.prototype.function = function () {
        return this._name;
    };
    BaseRecipeCategory.prototype.function = function (val) {
        this._name = val;
    };
    Object.defineProperty(BaseRecipeCategory.prototype, "foodGroups", {
        get: function () { },
        set: function () { },
        enumerable: true,
        configurable: true
    });
    BaseRecipeCategory.prototype.function = function () {
        return this._foodGroups;
    };
    BaseRecipeCategory.prototype.function = function (groups) {
        this._foodGroups = groups;
    };
    return BaseRecipeCategory;
})();

//# sourceMappingURL=baseRecipeCategory.js.map