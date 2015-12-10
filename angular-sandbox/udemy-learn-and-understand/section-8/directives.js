// DIRECTIVES
weatherApp.directive('weatherResult', function() {
  return {
    restrict: 'E',
    templateUrl: 'directives/weather-result.html',
    scope: {
      weatherDay: "=",
      convertToStandard: "&",
      convertToDate: "&",
      dateFormat: "@"
    },
    replace: true
  }
});
