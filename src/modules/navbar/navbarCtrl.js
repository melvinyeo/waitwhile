(function(){
	'use strict';

	var NavbarCtrl = function($scope, $state, AuthService, Notification){
	
		this.navbarCollapsed = true;
		var self = this;

		this.navbarCollapse = function() {
			if(!this.navbarCollapsed) {
				this.navbarCollapsed = true;
			}
		}

		AuthService.auth().$onAuth(function(authData) {
      		self.isSignedIn = authData;
    	});


		this.logOut = function() {
			AuthService.logOut();
			this.navbarCollapse();
			Notification.success({message: 'Logged out', delay: 1500})
		};
	};

	angular
		.module('waitlisterApp')
		.controller('NavbarCtrl', [
			'$scope', 
			'$state', 
			'AuthService',
			'Notification', 
			NavbarCtrl
		]);

})();