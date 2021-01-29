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

myApp.controller('mainController', ['$scope', function($scope) {
  $scope.name = 'main';
}]);

myApp.controller('secondController', ['$scope', '$routeParams', function($scope, $routeParams) {
  $scope.name = 'second';
	$scope.num = $routeParams.num || 0;
}]);
