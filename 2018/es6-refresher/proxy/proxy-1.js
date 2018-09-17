let person = {
	name: 'Ali'
}

// has all the methods of the reflect api
let handler = {
	get: function(target, prop) {
		return prop in target ? target[prop] : 'Default';
	}
};

var proxy = new Proxy(person, handler);

console.log(proxy.name, proxy.age);
