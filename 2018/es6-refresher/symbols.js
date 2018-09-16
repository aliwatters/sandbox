let symbol = Symbol('debug');
console.log(symbol);


obj = {
	name: 'ali',
	[symbol]: 22
};

console.log(obj);

let sym1 = Symbol.for('age');
let sym2 = Symbol.for('age');

console.log(sym1 == sym2);


let person = {
	name: 'Ali',
	age: 99
};

function makeAge(person) {
	let ageSymbol = Symbol.for('age');
	person[ageSymbol] = 27;
}

makeAge(person);

console.log(person[sym1]);
console.log(person);
