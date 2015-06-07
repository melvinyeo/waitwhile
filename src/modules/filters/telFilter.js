(function(){
    'use strict';
    var telFilter = function () {
    return function (tel) {
        if (!tel) { return ''; }
        return phoneUtils.formatNational(tel);
        };
    };

    angular.module('waitlisterApp')
    .filter('tel', telFilter);
    
})();