let array = [1, 2, 3];

console.log(typeof array[Symbol.iterator]);

let it = array[Symbol.iterator]();

console.log(it.next());
console.log(it.next());
console.log(it.next());

console.log(it.next());
