(function(){
	'use strict';

	var GuestsServedCtrl = function($scope, $firebase, FIREBASE_URL, guests){
		var self = this;
		var guestsArray = guests.guests;
		var restaurantObj = guests.restaurant;

		this.guests = guestsArray;
		this.restaurant = restaurantObj;
	};

	angular
	.module('guests', [])
	.controller('GuestsServedCtrl', [
		'$scope',
		'$firebase', 
		'FIREBASE_URL', 
		'guests',
		GuestsServedCtrl
	])
})();