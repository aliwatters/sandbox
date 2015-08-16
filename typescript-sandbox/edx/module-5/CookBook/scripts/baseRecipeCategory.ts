class BaseRecipeCategory {
    private _name: string;
    private _foodGroups: FoodGroup[] = [];

    //TODO: Create get and set blocks for each of the variables in the declaration above.

    get name = function() {
      return this._name;
    }

    set name = function(val: string) {
      this._name = val;
    }

    get foodGroups = function() {
      return this._foodGroups;
    }

    set foodGroups = function(groups: FoodGroup[]) {
      this._foodGroups = groups;
    }

}
