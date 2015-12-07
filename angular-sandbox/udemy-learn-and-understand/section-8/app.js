// MODULE
var weatherApp = angular.module('weatherApp', ['ngRoute', 'ngResource']);

// ROUTES
weatherApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/',{
        templateUrl: 'pages/main.html',
        controller: 'homeController'
      })
      .when('/forecast', {
        templateUrl: 'pages/forecast.html',
        controller: 'forecastController'
      });
}]);

// CONTROLLERS
weatherApp.controller('homeController', ['$scope', function($scope) {
  $scope.name = 'Home Page';
}]);

weatherApp.controller('forecastController', ['$scope', function($scope) {
  $scope.name = 'Forcast Page';
}]);
