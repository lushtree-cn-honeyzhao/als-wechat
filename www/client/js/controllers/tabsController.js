'use strict';

angular.module('app.controllers')
    .controller('tabsController', ['Storage', '$scope', '$ionicActionSheet','ENV',
        function (Storage, $scope, $ionicActionSheet,ENV) {

        $scope.callCenterTel = ENV.callCenterTel

        $scope.showCall = function () {
            //console.log("showCall:ENV->"+JSON.stringify(ENV))
            $ionicActionSheet.show({
                buttons: [
                    {text: $scope.callCenterTel}
                ],
                titleText: '点击拨打客服电话',
                cancelText: '取消',
                buttonClicked: function (index) {
                    window.location = 'tel:' + $scope.callCenterTel;
                    return true;
                }
            });
        }

    }])
