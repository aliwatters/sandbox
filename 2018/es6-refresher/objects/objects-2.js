class Obj1 {
	constructor() {
		this.a = 1;
	}
}

class Obj2 {
	constructor() {
		this.b = 2;
	}
}

let obj1 = new Obj1();
let obj2 = new Obj2();

let obj = Object.assign(obj1, obj2);
// note; obj gets class of first argument

console.log(obj);
console.log(obj instanceof Obj1);
console.log(obj instanceof Obj2);

let objA = Object.assign({}, obj1, obj2);

console.log(objA.__proto__ === Object.prototype);

