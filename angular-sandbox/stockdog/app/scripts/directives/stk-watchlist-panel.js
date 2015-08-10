'use strict';

angular.module('stockDogApp')
  // 1- register directive and inject dependencies
  .directive('stkWatchlistPanel',
    function($location, $modal, $routeParams, WatchlistService) {
      return {
        templateUrl: 'views/templates/watchlist-panel.html',
        restrict: 'E',
        scope: {},
        link: function($scope) {
          // 2 - initialize variables
          $scope.watchlist = {};
          $scope.currentList = $routeParams.listId;
          var addListModal = $modal({
            scope: $scope,
            template: 'views/templates/addlist-modal.html',
            show: false
          });

          // 3 - bind model from service to this scope
          $scope.watchlists = WatchlistService.query();

          // 4 - display addlist modal
          $scope.showModal = function() {
            addListModal.$promise.then(addListModal.show);
          };

          // 5 - create a new list from fields in modal
          $scope.createList = function() {
            WatchlistService.save($scope.watchlist);
            addListModal.hide();
            $scope.watchlist = {};
          };

          // 6 - delete desired list and redirect to home
          $scope.deleteList = function(list) {
            WatchlistService.remove(list);
            $location.path('/');
          };

          // 7 - send users to desired watchlist
          $scope.gotoList = function(listId) {
            $location.path('watchlist/' + listId);
          }
        }
      };
    });
