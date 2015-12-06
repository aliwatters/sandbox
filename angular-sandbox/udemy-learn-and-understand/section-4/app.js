var myApp = angular.module('myApp', []);

myApp.controller('mainController', ['$scope', '$timeout', '$filter', '$http',
  function($scope, $timeout, $filter, $http) {
    $scope.handle = '';

    $scope.characters = 8;

    $scope.rules = [{
      text: "Must be awesome"
    }, {
      text: "Must not be already used"
    }, {
      text: "Must be cool"
    }];


    $scope.map = {};

    $scope.lowercasehandle = function() {
      return $filter('lowercase')($scope.handle);
    };


    $http.get('https://dev.worldmapmaker.com/api/map/53')
      .success(function(res) {
        console.log(res);
        $scope.map = res.data || {
          title: 'none'
        };
      })
      .error(function(data, status) {
        console.log();
      });

    $scope.newthing = '';

    $scope.addNewThing = function() {
      $http.post('/api/map/53', {
          text: $scope.newthing
        })
        .success(function(res) {
          console.log('RES', res);
        })
        .error(function(data, status) {
          console.error('API RESPONSE', status);
        });
    }
  }
]);
