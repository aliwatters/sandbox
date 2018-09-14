class Person {
	constructor(name) {

		this._name = name;
	}

	get name() {
		return this._name.toUpperCase();
	}

	set name(value) {
		if (value.length > 2) {
			this._name = value;
		} else {
			console.log("Rejected!");
		}
	}
}

let person = new Person("Al");

person.name = "Ai";
person.name = "Ali";
console.log(person.name);
