(function(){

	var ConfirmRestaurantModalCtrl = function ($modalInstance, AuthService) {
		// var self = this;
		this.loading = false;

		this.submit = function(form, formData) {
			if(!form.$valid) return;
			$modalInstance.close(formData);
			this.loading = true;
		};

		this.cancel = function () {
			$modalInstance.dismiss('cancel');
		};
	};

	angular
	.module('login')
	.controller('ConfirmRestaurantModalCtrl', [
		'$modalInstance', 
		'AuthService',
		ConfirmRestaurantModalCtrl
	])

})();