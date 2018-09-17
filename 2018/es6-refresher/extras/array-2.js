let array = [1, 2, 3];
console.log(array.copyWithin(1, 2));
console.log(array.copyWithin(1, 0, 2));

let it = array.entries();
for (let el of it) {
	// el is [index, val];
	console.log(el);
}
