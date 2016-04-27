/**
 * Created by cc on 15-8-6.
 */
angular.module('app.controllers').controller('datePicker',
    ['$scope', 'dateFilter', 'datePickerService', 'pickadateUtils', '$ionicPopup', '$rootScope',
        function ($scope, dateFilter, datePickerService, pickadateUtils, $ionicPopup, $rootScope) {

            $scope.isNotMin = function(modal, time){
                if($scope.min){
                    return $scope.timeConf(time, modal).getTime() > $scope.min
                }else{
                    return true
                }
            }

            $scope.isNotMax = function(modal, time){
                if($scope.max){
                    return $scope.timeConf(time, modal).getTime() < $scope.max
                }else{
                    return true
                }
            }

            $scope.timeConf = function(hours, modal) {
                var date = modal == undefined ? dateFilter(new Date(), 'yyyy-MM-dd') : modal
                var result = pickadateUtils.stringToDate(date)
                result.setHours(hours)
                return result
            }

            var range = datePickerService.range()
            if (range.max) {
                $scope.max = range.max
            }
            if (range.min) {
                $scope.min = range.min
            }

            $scope.closedateModal = function (modal, time) {
                var time = $scope.timeConf(time, modal)
                datePickerService.set(time)
                datePickerService.goBack()
                datePickerService.callback()
            }

        }])


angular.module('app.services').factory('datePickerService',
    ['$state', '$location','$window',
    function ($state, $location,$window) {

    var range = {max: null, min: null}
    var date = {}
    var $path = ''
    var callback

    return {
        openPicker: function (fn, config) {
            if (angular.isObject(config)) {
                //这里max和min为时间戳
                range.max = config.max?config.max.getTime():null
                range.min = config.min?config.min.getTime():null
            }
            $path = $location.$$path
            callback = fn
            $state.go('datePicker')
        },
        range: function () {
            return range
        },
        set: function (t) {
            date = angular.copy(t)
        },
        goBack: function () {
            $window.history.back()
        },
        callback: function () {
            callback(date)
        }
    }

}]);




//angular.module('app.controllers').controller('timeSelect',
//    ['$scope', '$interval',
//        function ($scope, $interval) {
//
//            var model = $scope.model = {
//                fromSpeed : 0,
//                from : new Date()
//            }
//
//            var timeoutPromise  = null
//            $scope.mouseup = function(){
//                if(timeoutPromise) $interval.cancel(timeoutPromise);
//                model.fromSpeed=0
//            }
//            $scope.$watch('model.fromSpeed',function(){
//                if(timeoutPromise) $interval.cancel(timeoutPromise);
//                timeoutPromise = $interval(function(){
//                    if(model.fromSpeed==0 && timeoutPromise) $interval.cancel(timeoutPromise);
//                    model.from = change(model.from,model.fromSpeed)
//                },1000/Math.abs(model.fromSpeed))
//            })
//
//            $scope.click = function(date,e){
//                if(e=='+'){
//                    change(date,1)
//                }else if(e=='-'){
//                    change(date,-1)
//                }
//            }
//
//            function change(date,fromSpeed){
//                if(date.getHours() <= 9){
//                    date.setHours(9, 0, 0, 0)
//                }else{
//                    date.setHours(18, 0, 0, 0)
//                }
//                if(fromSpeed>0){
//                    if(date.getHours() == 9){
//                        date.setHours(18, 0, 0, 0)
//                    }else if(date.getHours() == 18){
//                        date.setHours(9, 0, 0, 0)
//                        date.setDate(date.getDate() + 1)
//                    }
//                }else{
//                    if(date.getHours() == 9){
//                        date.setHours(18, 0, 0, 0)
//                        date.setDate(date.getDate() - 1)
//                    }else if(date.getHours() == 18){
//                        date.setHours(9, 0, 0, 0)
//                    }
//                }
//                return date
//            }
//
//        }])