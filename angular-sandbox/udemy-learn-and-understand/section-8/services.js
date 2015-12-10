// SERVICES
weatherApp.service('cityService', ['$http', function($http) {
  // var self = this;

  this.city = 'Portland, OR'; // initial value
}]);

weatherApp.service('weatherService', ['$resource', function($resource) {
  this.GetWeather = function(city, days) {
    var weatherAPI = $resource('http://api.openweathermap.org/data/2.5/forecast/daily', {
      callback: "JSON_CALLBACK"
    }, {
      get: {
        method: "JSONP"
      }
    });

    return weatherAPI.get({
      q: city,
      cnt: days,
      APPID: '2f6b71eb7cc8780a78899580c2363dc5'
    });
  };
}]);
