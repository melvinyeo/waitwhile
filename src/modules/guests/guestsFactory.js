(function(){

	var guestsFactory = function($firebase, FIREBASE_URL, $q, _){
		var Guests = {

			get: function(restaurantId) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "guests/" + restaurantId);
				var guestsArray = $firebase(ref).$asArray();
				guestsArray.$loaded()
					.then(function(guests) {
						deferred.resolve(guests)
					})
					.catch(function(error) {
						deferred.reject(error);
				})

				return deferred.promise;
			},
			add: function(party, restaurantId) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "guests/" + restaurantId + "/" + party.$id);
				
				var guest = $firebase(ref).$asObject()

				guest.$loaded()
					.then(function(guest) {
						guest.$priority = Date.now();
						guest.lastServed = Date.now();
						guest.lastWaitTime = Date.now() - party.dateCreated;
						guest.visits ?
							guest.visits++ :
							guest.visits = 1;
						guest.averageWaitTime = guest.averageWaitTime ? 
							(guest.averageWaitTime * (guest.visits - 1) + guest.lastWaitTime)/guest.visits :
							 guest.lastWaitTime;
						guest.name = party.name;
						guest.phone = party.phone;
						guest.averagePartySize = guest.averagePartySize ? 
							(guest.averagePartySize * (guest.visits - 1) + party.size) / guest.visits :
							 party.size;
						
						return guest.$save()
					})
					.then(function(guest) {
						deferred.resolve(guest)
					})
					.catch(function(error) {
						deferred.reject(error);
					})
				
				return deferred.promise;
			},

			add2: function(party, restaurantId) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "guests/" + restaurantId);
				var guestsArray = $firebase(ref).$asArray();

				// Set how long it took to be waited
				party.dateServed = Date.now();
				party.waitTime = Date.now() - party.dateCreated;

				guestsArray.$loaded()
					.then(function(guests) {
						return guests.$add(party)
					})
					.then(function(guests) {
						deferred.resolve(guests)
					})
					.catch(function(error) {
						deferred.reject(error);
				})

				return deferred.promise;
			},

			getWaitTime: function(restaurantId) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "guests/" + restaurantId);
				var guestsArray = $firebase(ref).$asArray();
				var totalWaitTime = 0;
				var avgWaitTime = {exactMs: 0, roundedMins: 0};

				guestsArray.$loaded()
					.then(function(guests) {
						if (guests.length > 0) {
							angular.forEach(guests, function(guest, index) {
								totalWaitTime = totalWaitTime + guest.averageWaitTime;
							})
							
							avgWaitTime.exactMs = totalWaitTime/guests.length;
							avgWaitTime.roundedMins = Math.ceil((totalWaitTime/guests.length)/60000);
						};

						deferred.resolve(avgWaitTime)
					})
					.catch(function(error) {
						deferred.reject(error);
				})

				return deferred.promise;
			},
			getTopRegular: function(uid) {
				var deferred = $q.defer();
				var guestsArray = Guests.get(uid)
					.then(function(guests) {
						console.log(guests);

						var o = { freq: { }, most: '' };
						_(guests).each(function(s) {
						    o.freq[s] = (o.freq[s] || 0) + 1;
						    if(!o.freq[o.most] || o.freq[s] > o.freq[o.most])
						        o.most = s;
						});

						console.log(o);
						deferred.resolve(guestsArray)
					})
					.catch(function(error) {
						deferred.reject(error);
				});

				return deferred.promise;
			}
		};

		return Guests;
	};

	angular.module('waitlisterApp')
	.factory('Guests', [
		'$firebase', 
		'FIREBASE_URL', 
		'$q',
		'_',
		guestsFactory
	]);
})();