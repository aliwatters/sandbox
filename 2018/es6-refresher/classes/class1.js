class Helper {
	static logTwice(message) {
		console.log(message);
		console.log(message);
	}
}

Helper.logTwice("Hello");

class Person {
	constructor(name) {
		this.name = name;
	}
	greet() {
		console.log("Hello");
	}
}

class Ali extends Person {
	constructor(age) {
		super("Ali");
		this.age = age;
	}
	greet() {
		console.log("Hello, my name is " + this.name + " and I am " + this.age);
	}
}

let person = new Person("Sarah");

person.greet();

let ali = new Ali(99);
ali.greet();
