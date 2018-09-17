class Person {
	constructor(name) {
		this.name = name;
	}	
}

function TopObj() {
	this.age = 27;
}

let person = Reflect.construct(Person, ['Ali'], TopObj);


console.log(person);
console.log(person.__proto__ == TopObj.prototype);
