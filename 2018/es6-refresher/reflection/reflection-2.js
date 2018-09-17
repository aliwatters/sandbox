class Person {
	constructor(name, age) {
		this.name = name;
		this.age = age;
	}
	greet(prefix) {
		console.log(prefix + " Hello I am " + this.name);
	}
}

let person = Reflect.construct(Person, ['Ali', 99]);
Reflect.apply(person.greet, {name:'Fred'}, ['...']);
