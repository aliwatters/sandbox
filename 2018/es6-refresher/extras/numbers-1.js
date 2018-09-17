let number = NaN;

// added to Number class - tidy up

console.log(Number.isNaN(number));
// true

console.log(Number.isFinite(10000));
// true

console.log(Number.isFinite(Infinity));
// false

console.log(Number.isInteger(10.2));
// false
