let obj = {
	[Symbol.iterator] : gen
}

function *gen() {
	yield 1;
	yield 2;
}

for (let element of obj) {
	console.log(element);
}


function *gen2(end) {
	for (let i = 0; i < end; i++) {
		yield i;
	}
}

let it = gen(2);
console.log(it.next());
console.log(it.next());
console.log(it.next());
console.log(it.next());
