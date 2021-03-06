const drink = {
  color: 'brown',
  carbonated: true,
  sugar: 40,
};

// tuple -- order of elements is important.
const pepsi = ['brown', true, 40];

// enforce with TS
type Drink = [string, boolean, number];
const coke: Drink = ['brown', true, 40];
const sprite: Drink = ['clear', true, 50];
const tea: Drink = ['brown', false, 0];

// issue with tuples is no information on what values are vs an object
const carSpecs: [number, number] = [400, 3345];

// Better in TS.
const carStats = {
  horsepower: 400,
  weight: 3345,
};

// Good for working with CSV files though!
