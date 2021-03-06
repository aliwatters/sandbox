const carMakers = ['ford', 'toyota', 'chevy'];
const dates = [new Date(), new Date()];

const carsByMake: string[][] = [['f150'], ['corolla'], ['camaro']];

// Help with inference when extracting values
const myCar1 = carMakers[0];
const myCar2 = carMakers.pop();

// Prevent incompatible values
// carMakers.push(100); // error!
carMakers.push('nissan'); // correct

// Help with 'map', 'foreach', 'reduce'

carMakers.map((car: string): string => {
  return car.toUpperCase(); // autocomplete help!
});

// Flexible types
const importantDates = [new Date(), '2030-10-10'];
// hover over has `(string | Date)[]`

const otherImportantDates: (string | Date)[] = [];
otherImportantDates.push('2040-09-09');
// otherImportantDates.push(100); // error
