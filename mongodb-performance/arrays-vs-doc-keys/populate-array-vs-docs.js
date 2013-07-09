var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;
	db.collection('myArray').drop();
    var collection = db.collection('myArray');

	var n = 100000,
		maxThingId = 300,
		avgThingCount = 30,
		thingCount, things;

	for (var i=0; i < n; i += 1) {
		thingCount = Math.floor(Math.random() * avgThingCount) * 2;
		things = [];

		for (var j=0; j < thingCount; j += 1) {
			things.push(Math.floor(Math.random() *  maxThingId));
		}
		var doc = {
			_id : i,
			things: things
		};

    	collection.insert(doc, function(err, docs) { });
		if (i % 1000 === 0) console.log('Populated:',i);
	}

	db.close();
  });



  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) {
    if(err) throw err;
	db.collection('myDoc').drop();

    var collection = db.collection('myDoc');

	var n = 100000,
		maxThingId = 300,
		avgThingCount = 30,
		thingCount, things;

	for (var i=0; i < n; i += 1) {
		thingCount = Math.floor(Math.random() * avgThingCount) * 2;
		things = {};

		for (var j=0; j < thingCount; j += 1) {
			var cid = Math.floor(Math.random() *  maxThingId);
			var now = new Date();
			things[cid] = {added: now, source: 'web'};
		}
		var doc = {
			_id : i,
			things: things
		};

    	collection.insert(doc, function(err, docs) { });
		if (i % 1000 === 0) console.log('Populated:',i);
	}

	db.close();
  });

// End of show
