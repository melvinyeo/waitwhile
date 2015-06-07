(function() {

	'use strict';

	// Declare app level module which depends on filters, and services
	angular
		.module('waitlisterApp', [
		  'firebase',
		  'login',
		  'waitlist',
		  'settings',
		  'dashboard',
		  'ui.router',
		  'ngAnimate',
		  'stateLoader',
		  'angular-spinkit',
		  'chart.js',
		  'ui-notification',
		  'ui.bootstrap',
		  'underscore',
		  'ngSanitize',
		  'ngCsv',
		  'angulartics', 
		  'angulartics.google.analytics',
		  'angularUtils.directives.dirPagination'
		])

		.run(["$rootScope", "$state", function($rootScope, $state) {
			$rootScope.$on("$stateChangeError", function(event, toState, 
				toParams, fromState, fromParams, error) {
			    // We can catch the error thrown when the $requireAuth promise is rejected
			    // and redirect the user back to the home page
			    if (error === "AUTH_REQUIRED") {
			    	$state.go("login");
			    };
			    if (error === "AUTH_REDIRECT") {
			    	$state.go("waitlist");
			    };
			    if (error === "RESTAURANT_DOESNT_EXIST") {
			    	$state.go("waitlistPublic404");
			    };
			});

		}])

		.config(["$stateProvider", '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
 		    $locationProvider.html5Mode(true);
 	    	$urlRouterProvider.otherwise('/');

		 	// Redirect user if NOT signed in
		 	var requireAuth = {
		 		"currentAuth": ["AuthService", function(AuthService) {
		 			return AuthService.auth().$requireAuth();
		 		}]
		 	};

		    // Redirect user if signed in
		    var redirectAuth = {
		    	"currentAuth": ["AuthService", '$q', function(AuthService, $q) {
		    		var deferred = $q.defer(); 
		    		var auth = AuthService.getAuth();
		    		if (!auth) {
		    			deferred.resolve();
		    		} else {
		    			deferred.reject('AUTH_REDIRECT');
		    		}
		    		return deferred.promise;
		    	}]
		    };

		    var DashboardCtrlResolve = {
		    	currentAuth: ["AuthService", function(AuthService) {
		    		return AuthService.auth().$requireAuth();
		    	}],
		    	restaurant: ['Restaurant', 'AuthService', 'Guests', '$q', function(Restaurant, AuthService, Guests, $q) {
		    		var restaurant = {};
		    		var deferred = $q.defer();

		    		Restaurant.getFromAuth(AuthService.getAuth().uid)
		    			.then(function(restaurantObj) {
		    				restaurant.obj = restaurantObj;
		    				return Guests.get(restaurantObj.$id);
		    			})
		    			.then(function(guests) {
		    				restaurant.guests = guests;
		    				return Guests.getWaitTime(restaurant.obj.$id)
		    			})
		    			.then(function(avgWaitTime) {
		    				restaurant.avgWaitTime = avgWaitTime.exactMs;
		    				deferred.resolve(restaurant);
		    			})
		    			.catch(function(error) {
		    				console.log(error);
		    				deferred.reject(error);
		    		});

		    		return deferred.promise;
		    	}]
		    };
		    
		    var GuestsServedCtrlResolve = {
		    	currentAuth: ["AuthService", function(AuthService) {
		    		return AuthService.auth().$requireAuth();
		    	}],
		    	guests: ['Restaurant', 'AuthService', 'Guests', function(Restaurant, AuthService, Guests) {
		    		var guestsObj = {};
		    		return Restaurant.getFromAuth(AuthService.getAuth().uid)
		    			.then(function(restaurantObj) {
		    				guestsObj.restaurant = restaurantObj;
		    				return Guests.get(restaurantObj.$id);
		    			})
		    			.then(function(guests) {
		    				guestsObj.guests = guests;
		    				return guestsObj;
		    			})
		    			.catch(function(error) {
		    				console.log(error);
		    		});
		    	}],
		    };

		    var WaitlistCtrlResolve = {
		    	currentAuth: ["AuthService", function(AuthService) {
		    		return AuthService.auth().$requireAuth();
		    	}],
		    	restaurant: ['Restaurant','AuthService', '$q', function(Restaurant, AuthService, $q) {
		    		var restaurant = {};
		    		var deferred = $q.defer();

		    		Restaurant.getFromAuth(AuthService.getAuth().uid)
		    			.then(function(restaurantObj) {
		    				restaurant.obj = restaurantObj;
		    				return Restaurant.getParties(restaurantObj.$id);
		    			})
		    			.then(function(parties) {
		    				restaurant.parties = parties;
		    				deferred.resolve(restaurant);
		    			})
		    			.catch(function(error) {
		    				console.log(error);
		    				deferred.reject(error);
		    		});
		    		return deferred.promise;
		    	}]
		    };


	     	var WaitlistPublicCtrlResolve = {
	     		restaurant: ['Restaurant', '$stateParams', '$q', '$rootScope', function(Restaurant, $stateParams, $q, $rootScope) {
	     			var restaurant = {};
	     			var deferred = $q.defer();
	     			// Hide navbar to prettify public waitlist (TODO: Make this better)
	     			$rootScope.hideNavbar = true;

	     			Restaurant.get($stateParams.restaurantId)
	     				.then(function(restaurantObj) {
	     					restaurant.obj = restaurantObj;
	     					return Restaurant.getParties(restaurantObj.$id);
	     				})
	     				.then(function(parties) {
	     					restaurant.parties = parties;
	     					deferred.resolve(restaurant);
	     				})
	     				.catch(function(error) {
	     					console.log(error);
	     					deferred.reject(error);
	     			});
	     			return deferred.promise;
	     		}]
	    	};

	    	var SettingsCtrlResolve = {
	    		currentAuth: ["AuthService", function(AuthService) {
	    			return AuthService.auth().$requireAuth();
	    		}],
	    		restaurant: ['Restaurant', 'AuthService', '$q', function(Restaurant, AuthService, $q) {
	    			var deferred = $q.defer();

	    			Restaurant.getFromAuth(AuthService.getAuth().uid)
	    				.then(function(restaurant) {
	    					deferred.resolve(restaurant);
	    				})
	    				.catch(function(error) {
	    					console.log(error);
	    					deferred.reject(error);
	    			});

	    			return deferred.promise;
	    		}]
	    	};

		 	$stateProvider
			    .state("home", {
			     	url: '/',
			     	templateUrl: 'modules/static/landingpage.html',
			     	resolve: {
         				"metaTitle": ["MetaInformation", "$rootScope", function(MetaInformation, $rootScope) {
         				MetaInformation.resetTitle();
         				$rootScope.hideNavbar = false;
	         		}]}
			    })
			    .state("features", {
			     	url: '/features',
			     	templateUrl: 'modules/static/features.html',
			     	resolve: {
         				"metaTitle": ["MetaInformation", function(MetaInformation) {
         				MetaInformation.setTitle('Waitlist Features and Benefits');
	         		}]}
			    })
			    .state("help", {
			     	url: '/help',
			     	templateUrl: 'modules/static/help.html',
 			     	resolve: {
         				"metaTitle": ["MetaInformation", function(MetaInformation) {
         				MetaInformation.setTitle('Help and Support');
 	         		}]}
			    })
			    .state("privacy", {
			     	url: '/privacy',
			     	templateUrl: 'modules/static/privacy.html',
 			     	resolve: {
         				"metaTitle": ["MetaInformation", function(MetaInformation) {
         				MetaInformation.setTitle('Privacy Policy');
 	         		}]}
			    })
			    .state("terms", {
			     	url: '/terms',
			     	templateUrl: 'modules/static/terms.html',
 			     	resolve: {
         				"metaTitle": ["MetaInformation", function(MetaInformation) {
         				MetaInformation.setTitle('Terms of Service');
 	         		}]}
			    })
			    .state("login", {
			     	url: '/login',
			     	templateUrl: 'modules/login/login.html',
			     	controller: 'LoginCtrl',
			     	controllerAs: 'auth',
			     	resolve: redirectAuth
			    })
			    .state("signup", {
			     	url: '/signup',
			     	templateUrl: 'modules/login/signup.html',
					controller: 'LoginCtrl',
					controllerAs: 'auth',
					resolve: redirectAuth
			    })
    	    	.state("waitlist", {
    		     	url: '/waitlist',
    		     	templateUrl: 'modules/waitlist/waitlist.html',
    		     	controller: 'WaitlistCtrl',
    		     	controllerAs: 'waitlist',
    		     	resolve: WaitlistCtrlResolve
    		    })
            	.state("waitlistPublic", {
        	     	url: '/list/:restaurantId',
        	     	templateUrl: 'modules/waitlist/waitlistPublic.html',
        	     	controller: 'WaitlistCtrl',
        	     	controllerAs: 'waitlist',
        	     	resolve: WaitlistPublicCtrlResolve
        	    })
            	.state("waitlistPublic404", {
        	     	url: '/error',
        	     	templateUrl: 'modules/waitlist/waitlistPublic404.html'
        	    })
			    .state("settings", {
			     	url: '/settings',
			     	templateUrl: 'modules/settings/settings.html',
			     	controller: 'SettingsCtrl',
			     	controllerAs: 'settings',
			     	resolve: SettingsCtrlResolve
			    })
			    .state("dashboard", {
			     	url: '/dashboard',
			     	templateUrl: 'modules/dashboard/dashboard.html',
			     	controller: 'DashboardCtrl',
			     	controllerAs: 'dashboard',
			     	resolve: DashboardCtrlResolve
			    })
			    .state("vertical_restaurant", {
			     	url: '/restaurant-waitlist',
			     	templateUrl: 'modules/static/verticals/restaurant.html',
			     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle('Restaurant waitlist app for free');
	         		}]}
			    })
			    .state("vertical_hairdresser", {
			     	url: '/hairdresser-waitlist',
			     	templateUrl: 'modules/static/verticals/hairdresser.html',
			     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle('Hairdresser and stylist waitlist app for free');
	         		}]}
			    })
			    .state("vertical_salon", {
			     	url: '/salon-waitlist',
			     	templateUrl: 'modules/static/verticals/salon.html',
			     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle('Salon waitlist app for free');
	         		}]}
			    })
			    .state("vertical_gym", {
			     	url: '/gym-waitlist',
			     	templateUrl: 'modules/static/verticals/gym.html',
			     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle('Gym waitlist app for free');
	         		}]}
			    })
			    .state("vertical_rental", {
			     	url: '/rental-waitlist',
			     	templateUrl: 'modules/static/verticals/rental.html',
			     	resolve: {
	    				"metaTitle": ["MetaInformation", function(MetaInformation) {
	    				MetaInformation.setTitle('Rental service waitlist app for free');
	         		}]}
			    })
    		    .state("vertical_pharmacy", {
    		     	url: '/pharmacy-waitlist',
    		     	templateUrl: 'modules/static/verticals/pharmacy.html',
    		     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle('Pharmacy waitlist app for free');
             		}]}
    		    })
    		    .state("vertical_doctor", {
    		     	url: '/doctor-office-waitlist',
    		     	templateUrl: 'modules/static/verticals/doctor.html',
    		     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle("Doctor's office waitlist app for free");
             		}]}
    		    })
			    .state("vertical_photography", {
			     	url: '/photography-waitlist',
			     	templateUrl: 'modules/static/verticals/photography.html',
			     	resolve: {
	    				"metaTitle": ["MetaInformation", function(MetaInformation) {
	    				MetaInformation.setTitle("Photography waitlist app for free");
	         		}]}
			    })
    		    .state("vertical_visioncare", {
    		     	url: '/vision-care-waitlist',
    		     	templateUrl: 'modules/static/verticals/visioncare.html',
    		     	resolve: {
        				"metaTitle": ["MetaInformation", function(MetaInformation) {
        				MetaInformation.setTitle("Vision care & eye exam waitlist app");
             		}]}
    		    })
		}])

		.value('FIREBASE_URL', 'https://waitlister.firebaseio.com/');
})();