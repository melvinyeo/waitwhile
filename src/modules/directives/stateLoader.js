(function() {
  'use strict'
  var stateLoader = function ($rootScope) {
      return {
        restrict: 'E',
        template: "<div><div ng-if='isStateLoading' class='loading-indicator'>" +
        "<div class='loading-indicator-body'>" +
        "<div class='spinner'><wave-spinner></wave-spinner></div>" +
        "</div>" +
        "</div>" +
        "</div>",
        replace: true,
        link: function(scope, elem, attrs) {
          scope.isStateLoading = false;
          $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams, fromState, fromStateParams) {
            if (toState.resolve) {
                scope.isStateLoading = true;
            }
          });
          $rootScope.$on('$stateChangeSuccess', function (event, toState, toStateParams, fromState, fromStateParams) {
            if (toState.resolve) {
                scope.isStateLoading = false;
            }
          });
          $rootScope.$on("$stateChangeError", function (event, toState, toStateParams, fromState, fromStateParams) {
            scope.isStateLoading = false;
          });
        }
      };
  };
  angular
  .module("stateLoader", [])
  .directive('stateLoader', [
    '$rootScope',
    stateLoader
  ]);
})();