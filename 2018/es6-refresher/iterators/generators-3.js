
function *gen(end) {
	for (let i = 0; i < end; i++) {
		try {
			yield i;
		} catch(e) {
			console.log(e);
		}
	}
}

let it = gen(2);
console.log(it.next());
console.log(it.throw('An error happened!'));
console.log(it.return('A value!')); // done true now!
console.log(it.next());
console.log(it.next());
