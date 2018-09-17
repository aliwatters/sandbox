class Person {
	constructor(name, age) {
		this._name = name;
		this.age = age;
	}

	get name() {
		return this._name;
	}

	set name(val) {
		this._name = val; 
	}
}

let mum = {
	_name: "Mum"
};

let person = new Person('Ali', 99);

Reflect.defineProperty(person, 'hobbies', {
	writable: true,
	value: ['Cleaning', 'Cooking'],
	configurable: true
});

Reflect.set(person, 'name', 'Anna', mum);

console.log(Reflect.get(person, 'name', mum));

console.log(Reflect.has(person, 'age'));

console.log(Reflect.ownKeys(person));

Reflect.deleteProperty(person, 'hobbies');
console.log(person);

console.log(Reflect.isExtensible(person));
Reflect.preventExtensions(person); 
console.log(Reflect.isExtensible(person));

Reflect.defineProperty(person, 'hair', {value: 'yellow'});

console.log(person.hair);


