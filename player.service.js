'use strict';
app.service('player', function ($http) {
  return {
    sachinData: function() {
      return $http.get('sachin.json');
    }
  }
});