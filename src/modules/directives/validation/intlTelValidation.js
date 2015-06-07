(function() {
	'use strict'
	var phoneValidatorDirective = function () {
		return {
			require : 'ngModel',
			link : function(scope, attr, elem, ctrl) {
				ctrl.$validators.phoneValidator = function(value) {
					if (value && value.length > 1) return phoneUtils.isValidNumber(value);
					else return false;      
              	};
              }
          }
      };
      angular
      .module("waitlisterApp")
      .directive('phoneValidator', [
      	phoneValidatorDirective
  		]);
 })();