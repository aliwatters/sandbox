'use strict';

angular.module('stockDogApp')
  .service('WatchlistService', function WatchlistService() {
    // 1 - helper load watchlists from localstorage
    var loadModel = function() {
      var model = {
        watchlists: localStorage['StockDog.watchlists'] ?
          JSON.parse(localStorage['StockDog.watchlists']) : [],
        nextId: localStorage['StockDog.nextId'] ?
          parseInt(localStorage['StockDog.nextId']) : 0
      };
      return model;
    };

    // 2 - helper Save watchlists to localStorage
    var saveModel = function() {
      localStorage['StockDog.watchlists'] = JSON.stringify(Model.watchlists);
      localStorage['StockDog.nextId'] = Model.nextId;
    };

    // 3 - helper use lodash to find watchlist with the givem id
    var findById = function(listId) {
      return _.find(Model.watchlists, function(watchlist) {
        return watchlist.id === parseInt(listId);
      });
    };

    // 4 - return all watchlists or find by given id
    this.query = function(listId) {
      if (listId) {
        return findById(listId);
      } else {
        return Model.watchlists;
      }
    };

    // 5 - save a new watchlist to watchlists model.
    this.save = function(watchlist) {
      watchlist.id = Model.nextId++;
      Model.watchlists.push(watchlist);
      saveModel();
    };

    // 6 - remove given watchlist from watchlists model
    this.remove = function(watchlist) {
      _.remove(Model.watchlists, function(list) {
        return list.id === watchlist.id;
      });
      saveModel();
    };

    // 7 - initialize model for this singleton server
    var Model = loadModel();
  });
