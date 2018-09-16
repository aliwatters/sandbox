let promise = new Promise(function(resolve, reject) {
	setTimeout(function() {
		//	resolve('Done!');
		reject('Failed');
	}, 1500);	
});


promise.then(
	function(value) {
		console.log(value);
	},
	function(error) {
		console.log(error);
	}
);
