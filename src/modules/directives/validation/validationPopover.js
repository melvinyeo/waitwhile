(function() {
  'use strict'

  var popPopupDirective = function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
      templateUrl: 'template/popover/popover.html'
    };
  };

  var popDirective = function ($tooltip, $timeout) {
    var tooltip = $tooltip('pop', 'pop', 'event');
    var compile = angular.copy(tooltip.compile);
    tooltip.compile = function (element, attrs) {    
      var toggle = false;
      attrs.$observe('popShow', function (val) {
        if (JSON.parse(val || false) || toggle) {
          $timeout(function () {
            element.triggerHandler('event');
            toggle = !toggle;
          });
        }
      });
      return compile(element, attrs);
    };
    return tooltip;
  };

  angular.module('waitlisterApp')
  .directive('popPopup', popPopupDirective)
  .directive('pop', [
    '$tooltip', 
    '$timeout', 
    popDirective]);
})();