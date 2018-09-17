let person = {
	name: 'Ali'
}

// has all the methods of the reflect api
let handler = {
	get: function(target, prop) {
		return prop in target ? target[prop] : 'Default';
	},
	set: function(target, prop, value) {
		if (value.length >= 2) {
			Reflect.set(target, prop, value);
		}
	}
};

var proxy = new Proxy(person, handler);

console.log(proxy.name, proxy.age);

proxy.name = 'A'; // is trapped by the proxy handler

console.log(proxy);
