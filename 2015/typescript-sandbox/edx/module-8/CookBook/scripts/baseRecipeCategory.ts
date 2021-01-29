//TODO:
//Modify this class to it implements the IBaseRecipeCategory interface

class BaseRecipeCategory {
  name: string;
  foodGroups: FoodGroup[] = [];

  constructor(name: string, foodGroups: FoodGroup[]) {
    this.name = name;
    this.foodGroups = foodGroups;
  }

}
