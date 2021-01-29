var myApp = angular.module('myApp', []);

// Controllers
myApp.controller('mainController', ['$scope', '$log', function($scope, $log) {
  $scope.people = [{
    address: 'Some address, Somewhere City, Some State, SS 33333',
    name: 'Jane Doe'
  }, {
    address: 'Some address, Somewhere City, Some State, SS 22222',
    name: 'Jolly Doe'
  }, {
    address: 'Some address, Somewhere City, Some State, SS 11111',
    name: 'John Doe'
  }];

  $scope.uppercaseAddress = function(person) {
    return person.address.toUpperCase();
  };
}]);


myApp.directive('searchResult', function() {

  return {
    templateUrl: 'directives/search-result.html',
    restrict: 'E',
    replace: true,
    scope: { // isolate the scope
      // pass data - two ways.
      personName: '@', // text passed through
      personObject: "=", // two way binding.
      uppercaseAddressFunction: "&" // passes function
    },
    /*
    compile: function(elem, attrs) {
      console.log('Compiling... ', elem.html());
      return {
        pre: function(scope, elems, attrs) {
          // console.log('pre-linking...', elems);
          // Don't use this runs before the child directives compiled
        },
        post: function(scope, elems, attrs) {}

    }*/
    link: function(scope, elem, attr) {
      // use this for things that would actually need code (ng-class could do this.)
      if (scope.personObject.name === 'Jane Doe') {
        elem.removeClass('list-group-item');
      }
    },
    transclude: true
  };

});
