let set = new Set([1,1,1,2,2,2,3,3,3]);

console.log(set);

set.add(4);

console.log(set.has(1));
set.delete(1);
console.log(set.has(1));

for (let el of set) {
	console.log(el);
}

set.clear();

console.log(set);

let set2 = new WeakSet([{a: 1}, {b: 2}]);

console.log(set2);
console.log(set2.has({a:2}));
console.log(set2.has({a:1}));

let a = {a: 5};
let b = {b: 6};

let set3 = new WeakSet([a,b,b]);
console.log(set3.has(a));
