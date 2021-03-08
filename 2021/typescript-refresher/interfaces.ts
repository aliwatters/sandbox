interface Vehicle {
  name: string;
  year: Date;
  broken: boolean;
  // summary(): string;
}

interface Reportable {
  // a thing that has a summary function
  summary(): string;
}

type MyCar = Vehicle & Reportable; // ?
// when and why to use Types vs Interfaces?

const oldCivic: MyCar = {
  name: 'civic',
  year: new Date('2000-01-01'),
  broken: true,
  summary() {
    return `Bruummm brum ${this.name}`;
  },
};

const newCivic: Vehicle = {
  name: 'civic',
  year: new Date('2020-01-01'),
  broken: false,
};
const myDrink = {
  name: 'coke',
  color: 'brown',
  carbonated: true,
  sugar: 40,
  summary() {
    return `My drink ${this.name} has ${this.sugar} grams of sugar`;
  },
};

const printVehicle = (vehicle: Vehicle): void => {
  console.log(`
    Name: ${vehicle.name}
    Year: ${vehicle.year}
    Broken?: ${vehicle.broken}
  `);
};

// Generic function that works for drinks and cars. Both have summary() func
const printSummary = (item: Reportable): void => {
  console.log(item.summary());
};

printVehicle(oldCivic);

printSummary(oldCivic);
// printSummary(newCivic); // doesn't satisfy the interface!

printSummary(myDrink);
