class Person {
	constructor(name) {
		this.name = 'Ali'; 
	}
}

let person = new Person();

console.log(Reflect.getPrototypeOf(person));
console.log(Reflect.getPrototypeOf(person) === person.__proto__);

let proto = {
	age: 30,
	greet() {
		console.log("Hello");
	}
};

Reflect.setPrototypeOf(person, proto);

console.log(Reflect.getPrototypeOf(person));
console.log(Reflect.getPrototypeOf(person) === Person.prototype);

Reflect.apply(person.greet, null, []);
