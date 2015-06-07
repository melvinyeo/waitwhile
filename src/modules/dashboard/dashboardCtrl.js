(function(){
	'use strict';

	var DashboardCtrl = function($scope, $firebase, FIREBASE_URL, AuthService, restaurant, Notification, MetaInformation){
		MetaInformation.setTitle('View your Dashboard');

		var self = this;
		this.loading = false;
		this.restaurant = restaurant.obj;
		this.guests = restaurant.guests;
		this.avgWaitTime = restaurant.avgWaitTime;

		// Prepare Chart data
		var labels = [];
		var customersServed = [];
		var customersWaitlisted = [];
		var customersNoShows = [];
		// var customersSMS = [];

		_.each(restaurant.obj.stats, function(key, value) {
			labels.push(value.replace('2015-', ""));
			customersWaitlisted.push(key.customersWaitlisted ? key.customersWaitlisted : 0);
			customersServed.push(key.customersServed ? key.customersServed : 0);
			customersNoShows.push(key.customersNoShows ? key.customersNoShows : 0);
			// customersSMS.push(key.customersSMS ? key.customersSMS : 0); 
		})

		var data = [customersServed, customersWaitlisted, customersNoShows];

		if (customersServed.length == 0 && customersWaitlisted.length == 0 && customersNoShows.length == 0) {
			this.chartData = null;
		} else {
			// Create Chart
			this.chartLabels = labels;
			this.chartSeries = ['Served', 'Waitlisted', 'No-Shows'];
			this.chartData = data;

			this.chartOnClick = function (points, evt) {
				// console.log(points, evt); 
			};
			Chart.defaults.global.colours[0] = "#46BFBD";
			Chart.defaults.Line.scaleShowHorizontalLines = false;
			Chart.defaults.Line.scaleShowVerticalLines = false;
		};

		// Export Guests as CSV function
		this.exportGuestCSV = function() {
			var guestCSV = this.guests;
			guestCSV.forEach(function(v){ 
				delete v.$$hashKey;
				delete v.$id;
				delete v.$priority;
				delete v.lastWaitTime;
				v.lastServed = new Date(v.lastServed); 
			});

			Notification.success({message: 'Guest list exported as CSV', delay: 3000});
			return guestCSV;
		};

		// Filter of table
		this.orderByField = 'lastServed';
		this.reverseSort = true;
	};

	angular
	.module('dashboard', [])
	.controller('DashboardCtrl', [
		'$scope',
		'$firebase', 
		'FIREBASE_URL', 
		'AuthService', 
		'restaurant', 
		'Notification',
		'MetaInformation',
		DashboardCtrl
	])
})();