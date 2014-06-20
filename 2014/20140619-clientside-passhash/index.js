var Hashes = require('jshashes');

// custom alphabet defined.
window._app = {
  Hashes : Hashes,
  alphabet : 'abcdefghijklmnopqrstuvwzxyzABCDEFGHIJKLMNOPQRSTUVWXYZ~!#$%^&*()_+-={};":<>?,./'
};
console.log('jsHashes loaded');

var str = 'This is a sample text!';
// new SHA1 instance and base64 string encoding

var SHA512 = new Hashes.SHA512();

// some stretching - 10 to test
var max = 10;
var i;
var code = str;

console.time('testing');
for (i = 0; i < max; i++) {
  code = SHA512.hex(code);
}
console.timeEnd('testing');
if (code === '86d2244eab6d733d690a7cf746cf450a23acd002e650667d0fb04055952ef30d384a075f595818410911ec5cdd8733d9e9e4b3ffa3b9e3ca61d05935c9c62b6f') {
  console.log('TEST PASSED');
} else {
  console.log('problem in browser for hashesjs');
}

