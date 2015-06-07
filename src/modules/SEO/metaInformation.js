(function() {
	
	'use strict';

	var MetaInformation = function() {
		var preTitle = "The simple and free waitlist app";
		var postTitle = " | Waitwhile";
		var title = preTitle + postTitle;
		var metaDescription = "Waitwhile™ is a simple and free app for managing waitlists. Add guests, send free SMS alerts and track wait times.";
		var metaKeywords = "waitwhile, waitlist, wait list, sms waitlist, waiting, waitinglist, waiting list, guest list, guest wait, waitlist app, restaurant waitlist, waitlist statistics, restaurant guest tracking, restaurant analytics";
		return {
			title: function() { return title; },
			setTitle: function(newTitle) { title = newTitle + postTitle; },
			resetTitle: function() { title = preTitle + postTitle; },
			metaDescription: function() { return metaDescription; },
			metaKeywords: function() { return metaKeywords; },
			setMetaDescription: function(newMetaDescription) { metaDescription = newMetaDescription; },
			appendMetaKeywords: function(newKeywords) {
				for (var key in newKeywords) {
					if (metaKeywords === '') {
						metaKeywords += newKeywords[key].name;
					} else {
						metaKeywords += ', ' + newKeywords[key].name;
					}
				}
			}
		};
	};

	angular
	.module('waitlisterApp')
	.service('MetaInformation', [
		MetaInformation
	]);
})();