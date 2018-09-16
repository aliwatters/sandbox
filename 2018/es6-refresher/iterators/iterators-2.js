// make any iterator iterable by implementing Symbol.iterator

let array = [];

array[Symbol.iterator] = function() {
	let nextValue = 10;
	return {
		next: function() {
			nextValue++;
			return {
				done: nextValue > 15 ? true : false,
				value: nextValue
			};
		}
	};
};

for (let element of array) {
	console.log(element);
}
