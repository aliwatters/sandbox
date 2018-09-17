let person = {
	name: "Ali"
}

let handler = {
	get: function(target, property) {
		return Reflect.get(target, property);
	}
};

let {proxy, revoke} = Proxy.revocable(person, handler);

console.log(proxy.name);

revoke();

console.log(proxy.name);
