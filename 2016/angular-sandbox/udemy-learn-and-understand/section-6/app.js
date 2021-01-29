// Demo of service === singleton
// uses watch to update service - is that the best way?

var myApp = angular.module('myApp', ['ngRoute']);

// test minification - might need protection
myApp.config(function($routeProvider) {

  $routeProvider
    .when('/', {
      templateUrl: 'pages/main.html',
      controller: 'mainController'
    })
    .when('/second/:num?', {
      templateUrl: 'pages/second.html',
      controller: 'secondController'
    });

});

// Services
myApp.service('nameService', function() {
  var self = this;

  this.name = 'John Doe';

  this.namelength = function() {
    return self.name.length;
  };

});

// Controllers
myApp.controller('mainController', ['$scope', '$log', 'nameService', function($scope, $log, nameService) {

  $scope.name = nameService.name;
  $scope.$watch(function() {
    nameService.name = $scope.name;
  })

  $log.log(nameService.name, nameService.namelength());

  $log.property = 'main';
  $log.log($log);
}]);

myApp.controller('secondController', ['$scope', '$routeParams', '$log', 'nameService', function($scope,
  $routeParams, $log, nameService) {

  $scope.name = nameService.name;
  $scope.$watch(function() {
    nameService.name = $scope.name;
  })

  $scope.num = $routeParams.num || 0;

  $log.log(nameService.name, nameService.namelength());

  $log.second = 'second';
  $log.log($log);
}]);
