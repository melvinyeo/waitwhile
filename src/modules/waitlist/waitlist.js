(function(){

	'use strict';

	var WaitlistCtrl = function($scope, $firebase, FIREBASE_URL, restaurant, Restaurant, Guests, SMS, Notification, MetaInformation){
		MetaInformation.setTitle('Waitlist for ' + restaurant.obj.restaurantName);

		var self = this;
		var restaurantObj = restaurant.obj;
		var restaurantId = restaurant.obj.$id;
		this.parties = restaurant.parties;
		this.restaurant = restaurant.obj;

		// Options for guest sizes and set 2 as default
		this.partySizeOptions = [
		  { label: '1 Guest', value: 1 },
		  { label: '2 Guests', value: 2 },
		  { label: '3 Guests', value: 3 },
		  { label: '4 Guests', value: 4 },
		  { label: '5 Guests', value: 5 },
		  { label: '6 Guests', value: 6 },
		  { label: '7 or more', value: 7 }
		];
		this.party = {size: this.partySizeOptions[1]};

		// TODO: Make it dynamic
		this.updateWaitTime = function() {
			Guests.getWaitTime(restaurantId)
				.then(function(avgWaitTime) {
					self.avgWaitTime = avgWaitTime.roundedMins;
			});
		};
		this.updateWaitTime();

		this.saveParty = function(form, party) {
			// Form validation
			if(!form.$valid) return;
			form.$setPristine();
			form.$setUntouched();

			// Form execution
			Restaurant.addParty(party, restaurantId, restaurantObj.restaurantName)
				.then(function(savedParty) {
					return SMS.sendConfirmedText(savedParty, restaurantObj);
				})
				.then(function(){
					return Restaurant.addStat(restaurantId, 'customersWaitlisted');
				})
				.then(function(){
					Notification.success({message: 'Added ' + party.name + ' to waitlist.', delay: 1500});
				})
				.catch(function(error) {
					Notification.error({message: 'Failed to add guest party. Please try again.', delay: 2000});
					console.log("Error adding party", error);
				});
			self.party = {size: self.partySizeOptions[1]};
		};

		this.smsParty = function(party) {
			party.smsLoading = true;
			SMS.sendReadyText(party, restaurantObj)
				.then(function(smsRef) {
				 	return Restaurant.setPartyNotified(party.$id, smsRef.key(), restaurantId);
				 })
				.then(function(){
					return Restaurant.addStat(restaurantId, 'customersSMS');
				})
				.then(function(smsRef) {
					Notification.warning({message: 'SMS sent to ' + party.name + '.', delay: 1500});
				})
				.catch(function(error) {
					Notification.error({message: error.message, delay: 3000});
					console.log("Error! Didn't send SMS", error);
				})
				.finally(function() {
					party.smsLoading = false;
			});
		};

		this.serveParty = function(party) {
			this.parties.$remove(party)
				.then(function() {
					return Guests.add(party, restaurantId);
				})
				.then(function(){
					return Restaurant.addStat(restaurantId, 'customersServed');
				})
				.then(function() {
					Notification.success({message: party.name + ' served.', delay: 1500});
					self.updateWaitTime();
				})
				.catch(function(error) {
					self.alert = error;
			});	
		};

		this.noShow = function(party) {
			this.parties.$remove(party)
				.then(function(){
					return Restaurant.addStat(restaurantId, 'customersNoShows')
				})
				.catch(function(error) {
					self.alert = error;
			});
		};
	};
		
	angular
	.module('waitlist', [
		'ui.router'
	])
	.controller('WaitlistCtrl', [
		'$scope', 
		'$firebase', 
		'FIREBASE_URL', 
		'restaurant',
		'Restaurant',
		'Guests',
		'SMS',
		'Notification',
		'MetaInformation',
		WaitlistCtrl
	])

})();