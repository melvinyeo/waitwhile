(function(){

	'use strict';

	var RestaurantFactory = function($firebase, FIREBASE_URL, $q, $filter) {

		var Restaurant = {
			/*jshint camelcase: false */
			create: function(restaurantData, uid) {
				var deferred = $q.defer();
				var restaurantId = restaurantData.restaurantName.replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
				var restaurantRef = new Firebase(FIREBASE_URL + "restaurants/" + restaurantId);
				
				// Check if restaurant with same name already exists
				restaurantRef.once('value', function(snapshot) {
					if(snapshot.exists()) {
						// Append id with random number between 1-100
						restaurantRef = new Firebase(FIREBASE_URL + "restaurants/" + restaurantId + Math.ceil(Math.random()*100));
					};
					
					var smsConfirmText = "Voila! You've been waitlisted to " + restaurantData.restaurantName +
							" - " + $filter('tel')(restaurantData.phone) + ".\n\n" +
							"View your turn in line here: waitwhile.com/list/" + restaurantId + ".";
				
					var smsReadyText = "Hi {name}, \n\n"
							+ "Your table at " + restaurantData.restaurantName + " is now ready. " +
							"Please check back in 5 min or call " + $filter('tel')(restaurantData.phone) + ".";

					
					var onComplete = function(error) {
					  if (error) {
					    deferred.reject(error);
					  } else {
					    $firebase(restaurantRef).$asObject().$loaded()
					    	.then(function(restaurantObj) {
					    		deferred.resolve(restaurantObj);
					    	})
					    	.catch(function(error) {
					    		deferred.reject(error)
				    	});
					  };
					};

					restaurantRef.set({
						userId: uid,
						priority: Date.now(),
						restaurantName: restaurantData.restaurantName,
						email: restaurantData.email,
						phone: restaurantData.phone,
						website: "",
						address: "",
						customersWaitlisted: 0,
						customersServed: 0,
						customersSMS: 0,
						customersNoShows: 0,
						smsReadyText: smsReadyText,
						smsConfirmText: smsConfirmText,
						allowPublicSignup: true
					}, onComplete);

					return deferred.promise;
				});
			},

			isNotExisting: function(uid) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + 'restaurants');

				// Load all restaurants and check if one with UID exists
				$firebase(ref).$asArray().$loaded()
					.then(function(restaurants) {
						var restaurant = _.find(restaurants, function(restaurant) {
						    return restaurant.userId == uid; 
						});

						if(restaurant) {
							var error = {code: "EXISTING_RESTAURANT"};
							deferred.reject(error);
						} else {
							deferred.resolve();
						};
					})
					.catch(function(error) {
						deferred.reject(error);
					});

				return deferred.promise;
			},

			get: function(restaurantId) {
				var deferred = $q.defer();

				// Return error if no restaurant ID in URL
				if (!restaurantId) {
					deferred.reject("RESTAURANT_DOESNT_EXIST");
				};

				var ref = new Firebase(FIREBASE_URL + 'restaurants/' + restaurantId);

				// Check if restaurant ID exists, otherwise return error
				ref.once('value', function(snapshot) {
					if(snapshot.exists()) {
						$firebase(ref).$asObject().$loaded()
							.then(function(restaurant) {
								deferred.resolve(restaurant);
							})
							.catch(function(error) {
								deferred.reject(error);
						});
					} else { deferred.reject("RESTAURANT_DOESNT_EXIST") };
				});

				return deferred.promise;
			},

			getFromAuth: function(uid) {
				var deferred = $q.defer();

				var ref = new Firebase(FIREBASE_URL + 'restaurants');

				// Run through all restaurants and pick out the one which maches user auth ID
				$firebase(ref).$asArray().$loaded()
					.then(function(restaurants) {
						var restaurant = _.find(restaurants, function(restaurant) {
						    return restaurant.userId == uid; 
						});
						return $firebase(ref.child(restaurant.$id)).$asObject().$loaded();
					})
					.then(function(restaurantObj) {
						deferred.resolve(restaurantObj);
					})
					.catch(function(error) {
						deferred.reject(error);
					})

				return deferred.promise;
			},

			getParties: function(restaurantId) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "restaurants/" + restaurantId + "/parties");
				var partiesRef = $firebase(ref).$asArray();
				partiesRef.$loaded()
					.then(function(parties) {
						deferred.resolve(parties)
					})
					.catch(function(error) {
						deferred.reject(error);
				})

				return deferred.promise;
			},

			addParty: function(party, restaurantId, restaurantName) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "restaurants/" + restaurantId + "/parties/" + party.phone);
				var partiesRef = $firebase(ref);

				partiesRef.$set({
					priority: Date.now(),
					dateCreated: Date.now(),
					restaurantName: restaurantName,
					phone: $filter('intlTel')(party.phone),
					notified: false,
					name: party.name,
					size: party.size.value,
					notes: party.notes || ""
				})
					.then(function() {
						return partiesRef.$asObject().$loaded();
					})
					.then(function(partyObj) {
						deferred.resolve(partyObj);
					})
					.catch(function(error) {
						deferred.reject(error);
				});
					
				return deferred.promise;
			},

			setPartyNotified: function(partyId, smsId, restaurantId) {
				var deferred = $q.defer();
				var ref = new Firebase(FIREBASE_URL + "restaurants/" + restaurantId + "/parties/" + partyId);
				var partyObj = $firebase(ref).$asObject();

				partyObj.$loaded()
					.then(function(partyObj) {
						partyObj.notified = true;
						partyObj.smsId = smsId;
						return partyObj.$save();
					})
					.then(function(partyObj) {
						deferred.resolve(partyObj)
					})
					.catch(function(error) {
						deferred.reject(error);
				});

				return deferred.promise;
			},

			addStat: function(restaurantId, stat) {
				var deferred = $q.defer();
				var today = localISOString().substring(0, 10);
				var restaurantRef = new Firebase(FIREBASE_URL + "restaurants/" + restaurantId);
				var statsRef = restaurantRef.child('/stats/').child(today);
		
				// TODO: Optimize this promise chain
				var restaurantRef = $firebase(restaurantRef).$asObject();
				var restaurantStatRef = $firebase(statsRef).$asObject();
				restaurantRef.$loaded()
					.then(function(restaurant) {
						restaurant[stat] ? 
						    restaurant[stat]++ : 
						    restaurant[stat] = 1;
						return restaurant.$save();
					})
					.then(function() {
						return restaurantStatRef.$loaded();
					})
					.then(function(restaurantStat) {
						restaurantStat[stat] ? 
						    restaurantStat[stat]++ : 
						    restaurantStat[stat] = 1;
						return restaurantStat.$save();
					})
					.then(function(restaurantStat) {
						deferred.resolve(restaurantStat)
					})
					.catch(function(error) {
						deferred.reject(error);
				});

				return deferred.promise;
			}

		};

		// Workaround for regular ISO function not giving local timezone
		var localISOString = function() {

		    var d = new Date()
		        , pad = function (n){return n<10 ? '0'+n : n;}
		        , tz = d.getTimezoneOffset() // mins
		        , tzs = (tz>0?"-":"+") + pad(parseInt(Math.abs(tz/60)));

		    if (tz%60 != 0)
		        tzs += pad(Math.abs(tz%60));

		    if (tz === 0) // Zulu time == UTC
		        tzs = 'Z';

		     return d.getFullYear()+'-'
		          + pad(d.getMonth()+1)+'-'
		          + pad(d.getDate())+'T'
		          + pad(d.getHours())+':'
		          + pad(d.getMinutes())+':'
		          + pad(d.getSeconds()) + tzs;
		};

		return Restaurant;

	};
	angular
		.module('waitlisterApp')
		.factory('Restaurant', [
			'$firebase',
			'FIREBASE_URL', 
			'$q', 
			'$filter',
			RestaurantFactory
		]);
})();