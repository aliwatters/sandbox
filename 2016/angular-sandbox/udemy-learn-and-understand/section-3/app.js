var myApp = angular.module('myApp', ['ngMessages', 'ngResource']);

myApp.controller('mainController', ['$scope', '$log', '$filter', '$resouce', function($scope, $log, $filter, $resouce {
      $scope.name = 'John';
      $scope.formattedname = $filter('uppercase')($scope.name);

      $log.info($scope.name);
      $log.info($scope.formattedname);
    }]);
