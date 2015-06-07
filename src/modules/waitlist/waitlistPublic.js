(function(){

	'use strict';

	var WaitlistPublicCtrl = function($firebase, FIREBASE_URL, restaurant, Restaurant, Guests, Notification, SMS, MetaInformation){
		MetaInformation.setTitle('Waitlist for ' + restaurant.obj.restaurantName);

		var self = this;
		var restaurantId = restaurant.obj.$id;
		var restaurantObj = restaurant.obj;
		this.restaurant = restaurant.obj;
		this.parties = restaurant.parties;
		// Update wait-time whenever a party has been served
		this.parties.$watch(function(event) {
			console.log(event);
			if(event.event == 'child_removed') {
				console.log("Noted removal");
				self.updateWaitTime();
			};
		});

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

		this.updateWaitTime = function() {
			Guests.getWaitTime(restaurantId)
				.then(function(avgWaitTime) {
					self.avgWaitTime = avgWaitTime.roundedMins;
			});
		};
		this.updateWaitTime();

		this.saveParty = function(form, party) {
			if(!form.$valid) return;
			// RESET FORM
			form.$setPristine();
			form.$setUntouched();
			Restaurant.addParty(party, restaurantId, restaurantObj.restaurantName)
				.then(function(savedParty) {
					// Successfully saved party!
					return SMS.sendConfirmedText(savedParty, restaurantObj);
				})
				.then(function(){
					return Restaurant.addStat(restaurantId, 'customersWaitlisted');
				})
				.then(function(partyRef) {
					// Successfully saved party!
					self.restaurant.customersWaitlisted++;
					Notification.success({message: "You've been added to the waitlist", delay: 1500});
				}, function(error) {
					console.log("Error adding party", error);
				});

			self.party = {size: self.partySizeOptions[1]};;
		};
	};
		
	angular
	.module('waitlist')
	.controller('WaitlistPublicCtrl', [
		'$firebase', 
		'FIREBASE_URL', 
		'restaurant',
		'Restaurant',
		'Guests',
		'Notification',
		'SMS',
		'MetaInformation',
		WaitlistPublicCtrl
	])

})();