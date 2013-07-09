MongoDB Arrays vs Doc Keys Performance Test
===========================================

Note: uses localhost mongodb on default port 27017, and the test db. Drops myArray myDoc collections and populates with simulated data.

usage:

npm install

node populate-array-vs-docs.js

node test-array.js
node test-doc.js

To see performance difference on 1000 lookups.

Data structure:

myArray = { _id : Number, things: [ Number, Number ... ]}

myDoc = {_id : Number, things : { 'Number' : { source : String, added : Date }, ... } }

The Doc is deliberatly more complicated -- as why else would you use it?

In a real life use case myArray would have a things_details sub-document which matches the myDoc approach, so there is a (small) storage overhead for the myArray approach.

Important -- ensureIndex is required and included in the populate script. To manually ensure the index:

> db.myArray.ensureIndex({things:1});
> db.myDoc.ensureIndex({things:1});

