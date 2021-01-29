//TODO:
//Fill out the body of this class so it extends BaseRecipeCategory
//and implements IRecipeCategory
//HINT: refer to the work you did on this in Module 6 to get started

class RecipeCategory implements IRecipeCategory extends BaseRecipeCategory {
  constructor() {
    constructor(name: string, foodGroups:FoodGroup[], public description:string) {
      super(name, foodGroups);
    }
  }
