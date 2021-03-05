let apples: number = 5;
let speed: string = "fast";
let hasName: boolean = true;

let nothingMuch: null = null;
let nothing: undefined = undefined;

// built in objects
let now: Date = new Date();

// Array
let colors: string[] = ["red", "green", "blue"];
let myNumbers: number[] = [1, 2, 3];
let truths: boolean[] = [true, true, false];

// Classes
class Car {}
let car: Car = new Car();

// Object literal
let point: { x: number; y: number } = {
  x: 10,
  y: 20,
};

// Function -- this is ugly.
const logNumber: (i: number) => void = (i) => {
  console.log(i);
};

// Function -- alternate... version
type NumberFunc = (i: number) => void;
const logNumber2: NumberFunc = (i) => {
  console.log(i);
};

// When to use annotations
// 1) Function that returns the 'any' type

const json = '{"x":10, "y":20}';
const coordinates: { x: number; y: number } = JSON.parse(json);
console.log(coordinates);

// 2) when we declare variable on one line
// and initialize it later

let words = ["red", "green", "blue"];
let foundWord: boolean;

for (let i = 0; i < words.length; i++) {
  if (words[i] === "green") {
    foundWord = true;
  }
}

// 3) a variable whose type cannot be inferred correctly
let numbers = [-10, -1, 12];
let numberAboveZero: number | false = false;

for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] > 0) {
    numberAboveZero = numbers[i];
  }
}
