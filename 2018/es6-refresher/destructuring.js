let a = 3;
let b = 8;

console.log(a,b);
[a, b] = [b, a];
console.log(a,b);

let obj = {
	name: "Ali",
	age: 99,
	greet: () => console.log("Hello")
}

let {name, greet: hello} = obj;

console.log(name);
hello();

