// DEPENDENCY INJECTION -- in  a nutshell.
var Person = function(firstname, lastname) {

  this.firstname = firstname;
  this.lastname = lastname;

}

var john = new Person('John', 'Doe');

function logPerson(person) {
  console.log(person);
}

logPerson();


// MODULE
var angularApp = angular.module('angularApp', []);

// CONTROLLERS
angularApp.controller('mainController', ['$scope', function($scope) {

}]);
