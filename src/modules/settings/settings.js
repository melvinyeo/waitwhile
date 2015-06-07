(function () {
	'use strict';
	var SettingsCtrl = function ($scope, $state, $firebase, FIREBASE_URL, AuthService, restaurant, Guests, $modal, Notification, MetaInformation) {
		MetaInformation.setTitle('Update your Settings');

		var self = this;
		this.loading = false;
    // Hide account settings if user is using Facebook or Google sign-in
    this.ShowAccountSettings = AuthService.getAuth().provider === 'password';

    // TODO: Get rid of scope by getting rid of "bind to" or making it accept 'this'
    restaurant.$bindTo($scope, 'restaurant').then(function () {
    	self.restaurant = $scope.restaurant;
    });

    this.notifyOnChange = function (input) {
    	Notification.success({message: input + ' updated!', delay: 2000});
    };

	// Combine with Remove account into 1 function
	this.changeEmail = function(newEmail) {
		if(newEmail) {
			var modalData = {
				type: 'EMAIL_CHANGE', 
				data: {
					currentEmail: self.restaurant.email, 
					newEmail: newEmail
				}
			};
			var modalInstance = openModal(modalData);

			modalInstance.result
			.then(function () {
				self.restaurant.email = newEmail;
				self.newEmail = '';
				Notification.success({message: 'Email updated', delay: 2000});
			});
		}
	};

	this.changePassword = function(oldPassword, newPassword) {
		AuthService.changePassword(self.restaurant.email, oldPassword, newPassword)
		.then(function() {
			Notification.success({message: 'Password updated!', delay: 2000});
			self.oldPassword = '';
			self.newPassword = '';
		})
		.catch(function(error) {
			Notification.error({message: 'Could not change password due to: ' + error.message + ' Please try again', delay: 3000});
		});
	};

	this.forgotPassword = function() {
		var email = this.restaurant.email;
		
		AuthService.forgotPassword(email)
		.then(function () {
			Notification.success({message: 'Password reset email sent!', delay: 2000});
		})
		.catch(function (error) {
			Notification.error({message: 'Could not send password email due to: ' + error.message + ' Please try again', delay: 3000});
		})
		.finally(function(){
			self.loading = false;
		});
	};

	this.removeAccount = function() {
		var modalData = {
			type: 'REMOVE_ACCOUNT', 
			data: {
				currentEmail: self.restaurant.email
			}
		};
		var modalInstance = openModal(modalData);
		
		modalInstance.result
		.then(function () {
			$state.go('home');
			Notification.error({message: 'Account removed. Welcome back anytime, friend.', delay: 3000});
		});
	};

	var openModal = function(modalData) {
		return $modal.open({
			templateUrl: 'modules/settings/settingsConfirmation.html',
			controller: 'SettingsConfirmationCtrl',
			controllerAs: 'confirmModal',
			windowClass: 'vertical-center',
			backdrop: 'static',
			resolve: {
				request: function () {
					return {
						type: modalData.type,
						data: modalData.data
					};
				}
			}
		});
	};
};

angular
.module('settings', [])
.controller('SettingsCtrl', [
	'$scope',
	'$state',
	'$firebase', 
	'FIREBASE_URL', 
	'AuthService', 
	'restaurant', 
	'Guests',
	'$modal',
	'Notification',
	'MetaInformation',
	SettingsCtrl
	])
})();