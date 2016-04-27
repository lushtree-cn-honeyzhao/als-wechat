
angular.module('app.services').factory('ez_state',
    ['$state',
        function ($state) {

            function go_without_cache(to, params, options){

                params = angular.extend({ rnd: Math.random() +"_"+ new Date().getTime() }, params)

                $state.go(to, params, options)
            }

            return {
                go_without_cache: function (to, params, options) {
                    go_without_cache(to, params, options)
                }

            }

        }])