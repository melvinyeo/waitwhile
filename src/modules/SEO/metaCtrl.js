(function() {
	
	'use strict';

	var MetaCtrl = function($scope, MetaInformation) {
		  $scope.MetaInformation = MetaInformation;
		}

	angular
	.module('waitlisterApp')
	.controller('MetaCtrl', [
		'$scope',
		'MetaInformation',
		MetaCtrl
	]);

})();