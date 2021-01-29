var MongoClient = require('mongodb').MongoClient,  async = require('async');

var n = 1000; // lookups synchronously.
	userCount = 100000, // same as populating app
	thingCount = 300;

// NOTE: data in the two tables is not an exact match -- but generated through the same method, so should have the same heuristsics.

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
	if(err) throw err;

	var colname = 'myArray';
	//var colname = 'myDoc';
	var collection = db.collection(colname);

	var thingId, userId, myFuncs = {}, results = {};

	for (var i=0; i < n; i += 1) {
			// do user_id based lookup

		if (colname === 'myArray') {

			// array version!
			myFuncs[i] = (function() {
				var	thingId = Math.floor(Math.random() * thingCount) + 1;
				return function(callback) {
					collection.find({'things':thingId}, {'_id':1}, function(err,cursor) {
						results[thingId] = [];
						cursor.each(function(err,item) {
							if (err || !item) callback();
							else results[thingId].push(item);
						});
					});
				};
			})();

		} else {

			// doc versions!
			myFuncs[i] = (function() {
				var	thingId = Math.floor(Math.random() * thingCount) + 1;
				return function(callback) {
					var field = 'things.'+thingId;
					var q = {};
					q[field] = {'$exists': true};
					collection.find(q, {'_id':1}, function(err,cursor) {
						results[thingId] = [];
						cursor.each(function(err,item) {
							if (err || !item) callback();
							else results[thingId].push(item);
							// console.log(item);
						});
					});
				};
			})();

		}
	}


	var finalFunc = function(err) {
		console.timeEnd('lookup');
		db.close();
	}
	//myFuncs.finalFunc = finalFunc;
	console.log(n,'lookups via', colname);
	console.time('lookup');

	async.series(myFuncs, finalFunc);

});

// End of show
