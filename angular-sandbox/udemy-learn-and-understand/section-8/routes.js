// ROUTES
weatherApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'pages/main.html',
      controller: 'homeController'
    })
    .when('/forecast/:days?', {
      templateUrl: 'pages/forecast.html',
      controller: 'forecastController'
    });
}]);
