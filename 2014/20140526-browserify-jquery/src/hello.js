'use strict';

$.fn.extend({
  hello : function(source) {
    alert('hello from ' + source + '!');
  }
});

console.log('and the result hello is:', $.fn.hello);
$.fn.hello('the module');
