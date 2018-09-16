class Person {

}


let person = new Person;
console.log(person);

// es6 well known symbols
Person.prototype[Symbol.toStringTag] = 'A really funky fish';

console.log(person);


let numbers = [1, 2, 3];
numbers[Symbol.toPrimitive] = function() {
	console.log(this);
	return 999;
}
console.log(numbers);

console.log(numbers + 1);
