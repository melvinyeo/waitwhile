(function(){

	'use strict';

	var SettingsConfirmationCtrl = function ($modalInstance, request, AuthService) {
		var self = this;
		this.updateAccount = function(currentPassword) {
			this.loading = true;
			if (request.type == 'EMAIL_CHANGE') {
				AuthService.changeEmail(request.data.currentEmail, currentPassword, request.data.newEmail)
				.then(function() {
					$modalInstance.close('EMAIL_CHANGE_SUCCESS');
				})
				.catch(function(error) {
					self.loading = false;
					self.alert = error;
				});
			};
			if(request.type == 'REMOVE_ACCOUNT') {
				AuthService.removeUser(request.data.currentEmail, currentPassword)
				.then(function() {
					$modalInstance.close('ACCOUNT_REMOVED');
				})
				.catch(function(error) {
					self.loading = false;
					self.alert = error;
				});
			};
		};

		this.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	};

	angular
	.module('settings')
	.controller('SettingsConfirmationCtrl', [
		'$modalInstance', 
		'request',
		'AuthService',
		SettingsConfirmationCtrl
		])

})();