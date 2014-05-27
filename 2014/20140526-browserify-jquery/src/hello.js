'use strict';

$.fn.extend({
  hello : function(source) {
    alert('hello from ' + source + '!');
  }
});

console.log('and the result hello is:', $.fn.hello); // how to get for use in main.
$.fn.hello('the module');
