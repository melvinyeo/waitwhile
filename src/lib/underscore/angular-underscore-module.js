(function() {

  "use strict";

  var underscoreFactory = function() {
      return window._; // assumes underscore has already been loaded on the page
  };

  angular
  .module('underscore', [])
  .factory('_', [
	underscoreFactory
	]);

})();