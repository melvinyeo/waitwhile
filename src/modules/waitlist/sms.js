(function(){

  'use strict';

  var smsFactory = function(FIREBASE_URL, $firebase, $q) {
        var SMS = {
          sendReadyText: function(party, restaurant) {
            var deferred = $q.defer();
            var smsRef = $firebase(new Firebase(FIREBASE_URL + 'sms' + '/ready'));
            if (restaurant.smsReadyText) {
              var smsText = smsInsertVariables(restaurant.smsReadyText, restaurant, party)

              smsRef.$push({
                created: new Date().getTime(),
                name: party.name,
                partyId: party.$id,
                phone: party.phone,
                restaurantName: party.restaurantName,
                size: party.size,
                text: smsText
              })
              .then(function(smsRef) {
                deferred.resolve(smsRef);
              })
              .catch(function(error) {
                deferred.reject(error);
              });
            } else {
              deferred.reject({code: "ERROR_NO_SMS_TEXT", message: "No SMS sent since you've set it to empty. You can update this under Settings."});
            };

            return deferred.promise;
          },
          sendConfirmedText: function(party, restaurant) {
            var deferred = $q.defer();
            var smsRef = $firebase(new Firebase(FIREBASE_URL + 'sms' + '/confirmed'));

            if (restaurant.smsConfirmText) {
              var smsText = smsInsertVariables(restaurant.smsConfirmText, restaurant, party)

              smsRef.$push({
                created: new Date().getTime(),
                name: party.name,
                partyId: party.$id,
                phone: party.phone,
                restaurantName: party.restaurantName,
                size: party.size,
                text: smsText
              })
              .then(function(smsRef) {
                deferred.resolve(smsRef);
              })
              .catch(function(error) {
                deferred.reject(error);
              });
            } else {
              deferred.resolve({code: "ERROR_NO_SMS_TEXT", message: "No SMS sent since you've set it to empty. You can update this under Settings."});
            };

            return deferred.promise;
          }

        };

        // Replace variables with values in SMS text
        // TODO: Come up with a more elegant solution
        function smsInsertVariables(smsText, restaurant, party) {
          var regexName = /\{name\}/gi;
          var regexPartySize = /\{partySize\}/gi;
          var regexNotes = /\{notes\}/gi;
          // var regexRestaurantName = /\{restaurantName\}/gi;
          // var regexPhone = /\{phone\}/gi;
          // var regexAddress = /\{address\}/gi;
          // var regexUrl = /\{url\}/gi;

          return smsText
          .replace(regexName, party.name)
          .replace(regexPartySize, party.size)
          .replace(regexNotes, party.notes || 'notes')
            // .replace(regexRestaurantName, restaurant.restaurantName)
            // .replace(regexPhone, restaurant.phone)
            // .replace(regexAddress, restaurant.address)
            // .replace(regexUrl, "waitlister.firebaseapp.com/#/waitlist/" + restaurant.$id);
          }

        return SMS;
      };


      angular.module('waitlisterApp')
      .factory('SMS', [
        'FIREBASE_URL', 
        '$firebase', 
        '$q',
        smsFactory
        ])

    })();