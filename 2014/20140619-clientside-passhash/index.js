var Hashes = require('jshashes');

window._app = {
  Hashes : Hashes
};
console.log('jsHashes loaded');

var str = 'This is a sample text!';
// new SHA1 instance and base64 string encoding
var SHA512 = new Hashes.SHA512().hex(str);

// some stretching - 1024 to test

var max = 1024;
var i;

console.time('stretching');
for (i = 0; i < max; i++) {
  SHA512 = new Hashes.SHA512().hex(str);
}
console.timeEnd('stretching');

console.log('SHA512: ', SHA512);
