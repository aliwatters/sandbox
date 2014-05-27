var _ = require('underscore');
window.$ = $ = require('jquery');

require('./src/hello'); // this extended jquery..

console.log('checking extended hello', $.fn.hello);

$.fn.hello('app.js');


var interacted = false;
$('body').on('click',function() {
  console.log('on interaction', $.fn.hello);
  $.fn.hello('an event'); 
});

