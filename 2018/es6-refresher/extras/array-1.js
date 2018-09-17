let array1 = Array.of(5, 3, 5, 6, 8);
let array2 = [5, 3, 5, 6, 8];

console.log(array1, array2, array1 == array2);


let newArray = Array.from(array2, val => val * 2);

console.log(newArray);


let array3 = Array(10);
array3.fill(100);
console.log(array3);

let array4 = Array(10);
array4.fill(100, 3, 8);
console.log(array4);

console.log(array2.find(val => val >= 6)); // gives back first matching element


