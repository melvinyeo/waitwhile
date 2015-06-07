(function() {

	'use strict';

	var AuthService = function($firebase, $firebaseAuth, FIREBASE_URL, $q) {
		var ref = new Firebase(FIREBASE_URL);
		var authRef = $firebaseAuth(ref);

		this.auth = function() {
			return authRef;
		};

		this.getAuth = function() {
			return authRef.$getAuth();
		};

		this.logOut = function() {
			authRef.$unauth();
		};

		this.signin = function(user) {
			var deferred = $q.defer();
			var self = this;

			authRef.$authWithPassword({
				"email": user.email,
				"password": user.password
			}).then(function(authData) {
				deferred.resolve(authData);
			}, function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		};

		this.isSignedIn = function() {
			return authRef.$getAuth() != null ? true : false;
		};

		this.confirmPassword = function(password1, password2) {
			var deferred = $q.defer();

			if(password1 == password2) {
				deferred.resolve();
			} else {
				var error = {code: 'PASSWORD_NOT_CONFIRMED', message: 'Passwords does not match. Please try again' };
				deferred.reject(error);
			};

			return deferred.promise;
		};

		this.signup = function(user){
			var deferred = $q.defer();
			authRef.$createUser({
				email: user.email,
				password: user.password,
				restaurantName : user.restaurantName
			}).then(function(userData) {
				return authRef.$authWithPassword({
					email: user.email,
					password: user.password
				});
			}).then(function(authData) {
				deferred.resolve(authData);
			}).catch(function(error) {
				deferred.reject(error);
			});
			return deferred.promise;
		};

		this.signupOAuth = function(provider){
			var deferred = $q.defer();

			authRef.$authWithOAuthPopup(provider, { scope: "email" })
			.then(function(authData) {
				deferred.resolve(authData);
			})
			.catch(function(error) {
				// Fix for Chrome iOS which doesn't support pop-up auth
				if (error.code === "TRANSPORT_UNAVAILABLE") {
				     authRef.$authWithOAuthRedirect(provider, { scope: "email" })
				     .then(function(authData) {
				     	deferred.resolve(authData);
				     })
				     .catch(function(error) {
				     	deferred.reject(error);
				     });
			   } else {
			   		deferred.reject(error);
			   };
			});

			return deferred.promise;
		}

		this.forgotPassword = function(email) {
			var authRef = $firebaseAuth(ref);
			var deferred = $q.defer();
			authRef.$resetPassword({
			    email : email })
				.then(function() {
					console.log("Password reset email sent successfully");
					deferred.resolve();
				}).catch(function(error) {
					console.log("Error sending password reset email:", error);
					deferred.reject(error);
				});
			return deferred.promise;
		};

		this.changePassword = function(currentEmail, currentPassword, newPassword) {
			var authRef = $firebaseAuth(ref);
			var deferred = $q.defer();
			authRef.$changePassword({
				email    : currentEmail,
				oldPassword : currentPassword,
				newPassword : newPassword
				})
				.then(function() {
					console.log("Password Updated!");
					deferred.resolve();
				}).catch(function(error) {
					console.log("Password Update Error", error);
					deferred.reject(error);
				});
			return deferred.promise;
		};

		this.changeEmail = function(currentEmail, currentPassword, newEmail) {
			var authRef = $firebaseAuth(ref);
			var deferred = $q.defer();
			authRef.$changeEmail({
				oldEmail    : currentEmail,
				newEmail    : newEmail,
				password : currentPassword
				})
				.then(function() {
					console.log("Email Updated!");
					deferred.resolve();
				}).catch(function(error) {
					console.log("Email Update Error", error);
					deferred.reject(error);
				});
			return deferred.promise;
		};


		this.removeUser = function(currentEmail, currentPassword) {
			var authRef = $firebaseAuth(ref);
			var deferred = $q.defer();
			authRef.$removeUser({
				email    : currentEmail,
				password : currentPassword
				})
				.then(function() {
					console.log("User Deleted");
					deferred.resolve();
				}).catch(function(error) {
					console.log("User Deletion Error!", error);
					deferred.reject(error);
				});
			return deferred.promise;
		};

	};

	angular
		.module('waitlisterApp')
		.service('AuthService', [
			'$firebase',
			'$firebaseAuth',
			'FIREBASE_URL', 
			'$q', 
			AuthService
		]);

})();