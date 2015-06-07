(function() {
	'use strict';

	var LoginCtrl = function($state, $timeout, AuthService, Restaurant, $modal, $q, Notification, MetaInformation){
		MetaInformation.setTitle('Sign in to create your waitlist');
		
		var self = this;

		this.signup = function(form, formData) {
			// Form validation
			if(!form.$valid) return;

			this.alert = false;
			this.loading = true;

			AuthService.signup(formData)
				.then(function () {
					return Restaurant.create(formData, AuthService.getAuth().uid);
				})
				.then(function (){
					$state.go('waitlist');
					Notification.success({message: 'Welcome!', delay: 2000});
				})
				.catch(function(error) {
					self.loading = false;

				    self.alert = {
				    	type: 'error', 
				    	message: error.message, 
				    	code: error.code
				    };
			  	});
		};
		
		this.signupOAuth = function(service) {
			this.alert = false;
			var auth;

			AuthService.signupOAuth(service)
				.then(function (authData) {
					auth = authData;
					return Restaurant.isNotExisting(AuthService.getAuth().uid);
				})
				.then(function () {
					return confirmRestaurantModal(auth[service].email);
				})
				.catch(function(error) {
					// self.loading = false;
					if (error.code == 'EXISTING_RESTAURANT') {
						$state.go('waitlist');
						Notification.success({message: 'Welcome!', delay: 2000});
					} else {
						self.alert = {
							type: 'error', 
							message: error.message, 
							code: error.code
						};
					}
			  	});
		};

		function confirmRestaurantModal(email) {
			var deferred = $q.defer();
			
			var modalInstance = $modal.open({
				templateUrl: 'modules/login/confirmRestaurantModal.html',
				controller: 'ConfirmRestaurantModalCtrl',
				controllerAs: 'confirmRestaurant',
				windowClass: 'vertical-center',
                backdrop: 'static'
	      	});

		  	modalInstance.result
		  		.then(function (formData) {
		  			formData.email = email;
	  				return Restaurant.create(formData, AuthService.getAuth().uid);
		  		})
		  		// .then(function (){
		  		// 	return User.create(email, AuthService.getAuth().uid);
		  		// })
		  		.then(function() {
		  			$state.go('waitlist');
		  			deferred.resolve();
		  		})
		  		.catch(function(error) {
		  			self.loading = false;
		  			// error = 
	  				error = {
	  					type: 'error', 
	  					message: 'Please enter a restaurant name to continue. Try signing-up in again.', 
	  					code: 'INVALID_RESTAURANT_NAME'
  					};
  					AuthService.logOut();
  					deferred.reject(error);
	  		});

  			return deferred.promise;
		}

		this.login = function (form, user) {
			// Form validation
			if(!form.$valid) return;
			form.$setPristine();
			form.$setUntouched();

			this.alert = false;
			this.loading = true;
			
			AuthService.signin(user)
				.then(function (){
					$state.go('waitlist');
					Notification.success({message: 'Welcome!', delay: 2000});
				}, function (error) {
					self.loading = false;
					self.alert = {
						type: 'error', 
						message: error.message, 
						code: error.code
					};
			});
		};

		this.forgotPassword = function() {
			this.alert = false;
			this.loading = true;

			if(!self.user) {
				self.alert = {
					type: 'error', 
					message: 'Please enter your email above to request a new password.', 
					code: 'PASSWORD_RESET_EMAIL'
				};
				self.loading = false;
			} else {
				AuthService.forgotPassword(self.user.email)
				.then(function () {
					self.alert = {
						type: 'success', 
						message: 'We have sent you a password email!', 
						code: 'PASSWORD_RESET'
					};
				})
				.catch(function (error) {
					self.alert = {
						type: 'error', 
						message: error.message, 
						code: error.code
					};
				})
				.finally(function(){
					self.loading = false;
				});
			}
		};
	};

angular
	.module('login', [])
	.controller('LoginCtrl', [
		'$state', 
		'$timeout', 
		'AuthService', 
		'Restaurant',
		'$modal', 
		'$q',
		'Notification',
		'MetaInformation',
		LoginCtrl
	]);

})();