'use strict';

angular.module('app.controllers')
    .controller('AccountController',
    ['$rootScope', '$scope', 'app.api.http', '$filter', '$ionicPopup', '$state','$stateParams','$http','$timeout','ENV','Storage','$log','h5pay','$window',
        function($rootScope, $scope, http, $filter, $ionicPopup, $state,$stateParams,$http, $timeout, ENV, Storage,$log,h5pay,$window) {
    $scope.items = [];
        $scope.recharge = {amount:''};

    $scope.hasMoreData = false;

            $scope.buttonFlag3=''
            $scope.buttonText = '提交退款申请'
            var urlStr = ENV.api + 'accountApply/ifHasApply?authcode=' + Storage.getAccessToken().authcode;
            $http({method:'get', url:urlStr}).success(function (response,status,headers,config) {
                if(response.status<0){
                    $scope.buttonFlag3='disabled'
                    $scope.buttonText = '正在退款中...'
                }else{
                    $scope.buttonFlag3=''
                    $scope.buttonText = '提交退款申请'
                }
            }).error(function (data,status,headers,config){
                $log.error("status:"+status);
                alert('发生错误。');
            });

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.items = [];
        var urlStr = ENV.api + 'account/payment.json?authcode=' + Storage.getAccessToken().authcode;
        $log.debug('urlStr: '+urlStr);
        $http.get(urlStr).success(function (response,status,headers,config) {
            $scope.accountInfo = response.accountInfo;

            $log.debug('response.accountInfo: '+response.accountInfo);

            $scope.items = response.data;
            //angular.forEach($scope.items, function (element) {
            //   element.busiDescShow=element.busiDesc.split(" ")[0]
            //});
            //$log.debug('add on init:' + $scope.items.length);
            $scope.hasMoreData = true;
        }).error(function (data,status,headers,config){
            alert(data);
        });

    });

    $scope.moreDataCanBeLoaded = function() {
        return $scope.hasMoreData;
    }

    //Load more after 1 second delay
    $scope.loadMoreItems = function() {
        var start = $scope.items.length;

        var urlStr = ENV.api + 'account/currentUserAccountList.json?authcode=' + Storage.getAccessToken().authcode;
        $log.debug("urlStr:"+urlStr)
        $http({method:'get', url:urlStr, params:{start:start,length:10}}).success(function (response,status,headers,config) {
            $scope.hasMoreData = false;
            //$log.debug('add in loadMoreItems:' + $scope.items.length || 0);
            angular.forEach(response.data, function (element) {
                element.busiDescShow=element.busiDesc.split(" ")[0]
                $scope.items.push(element);
                $scope.hasMoreData = true;
            });
            $scope.hasMoreData = response.data.length > 0

        }).error(function (data,status,headers,config){
            $log.error("status:"+status);
            $scope.hasMoreData = false;
        });
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.submitRefundApply = function(){
        $scope.buttonFlag3=''
        $scope.buttonText = '提交退款申请'
        $log.debug('in submitRefundApply');
        var urlStr = ENV.api + 'accountApply/cashApply?authcode=' + Storage.getAccessToken().authcode;
        //$http({method:'post', url:urlStr, params:{balance:$scope.accountInfo.accountBalance, type:'backAmount'}}).success(function (response,status,headers,config) {
        $http({method:'post', url:urlStr, params:{balance:$scope.accountInfo.accountBalance, type:'backGuarantee'}}).success(function (response,status,headers,config) {
            alert(response.message);
            if(response.message.indexOf('尚未完成的订单')>0){
                $scope.buttonFlag3=''
                $scope.buttonText = '提交退款申请'
            }else{
                $timeout(function () {
                $scope.buttonFlag3='disabled'
                $scope.buttonText = '正在退款中...'
                }, 1);
            }
        }).error(function (data,status,headers,config){
            $log.error("status:"+status);
            alert('发生错误。');
        });

    };

    $scope.submitRecharge = function(){
        if($scope.recharge.amount<0.01 || $scope.recharge.amount>=10000 || isNaN($scope.recharge.amount)){
            $ionicPopup.alert({
                title: '提示',
                template: '请输入0.01元和10000元之间的数字<br>',
                okText: '确定'
            })
        }else{
            h5pay.pay($scope.recharge.amount * 100,'阿拉善智能监控充值','detail2','attach3',
                function(){//成功
                    $window.history.back()
                },function(){//退出
                    $window.history.back()
                },function(){//失败
                    $window.history.back()
                })
        }

    };


}]);
