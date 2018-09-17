let person = {
	name: 'Ali',
	age: 99
}

// has all the methods of the reflect api
let handler = {
	get: function(target, prop) {
		return prop in target ? target[prop] : 'Default';
	},
};

let proxy = new Proxy({}, handler);

Reflect.setPrototypeOf(person, proxy);

console.log(person.hobbies);
