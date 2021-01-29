//TODO:
//Fill out the body of this class so it extends BaseRecipeCategory
//and implements IRecipeCategory
//HINT: refer to the work you did on this in Module 6 to get started
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var RecipeCategory = (function (_super) {
    __extends(RecipeCategory, _super);
    function RecipeCategory() {
        constructor(name, string, foodGroups, FoodGroup[], public, description, string);
        {
            _super.call(this, name, foodGroups);
        }
    }
    return RecipeCategory;
})(BaseRecipeCategory);

//# sourceMappingURL=recipeCategory.js.map