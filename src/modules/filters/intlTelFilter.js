(function(){
    'use strict';
    var intlTelFilter = function () {
    return function (tel) {
        if (!tel) { return ''; }
        if (!phoneUtils.isValidNumber(tel)) { console.log("ERROR_INVALID_NUMBER: " + tel); }
        return phoneUtils.formatE164(tel);
        };
    };

    angular.module('waitlisterApp')
    .filter('intlTel', intlTelFilter);
    
})();