let promise1 = new Promise(function(resolve, reject) {
	setTimeout(function() {
		resolve('Resolved');
	}, 1000);
});

let promise2 = new Promise(function(resolve, reject) {
	setTimeout(function() {
		reject('Rejected');
	}, 2000);
});

// only if all are resolved then is run
Promise.all([promise1, promise2])
	.then(function(success) {
		console.log('ALL - ' + success);
	})
	.catch(function(error) {
		console.log('ALL - ' + error);
	});

// uses only the first to resolve
Promise.race([promise1, promise2])
	.then(function(success) {
		console.log('RACE - ' + success);
	})
	.catch(function(error) {
		console.log('RACE - ' + error);
	});

