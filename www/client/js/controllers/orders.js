'use strict';

angular.module('app.controllers').controller('RentCarOrdersController',
    ['$scope', 'app.api.http', '$state', '$log','ez_state',
        function ($scope, http, $state, $log,ez_state) {
            var step = 10
            $scope.items = [];
            $scope.hasMoreData = false;

            $scope.moreDataCanBeLoaded = function () {
                return $scope.hasMoreData;
            }
            $scope.doRefresh = function () {
                $scope.hasMoreData = false;
                $scope.items = [];
                _loadMoreItems();
            }

            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.doRefresh();
            });

            //Load more after 1 second delay
            $scope.loadMoreItems = function () {
                _loadMoreItems()
            };

            function _loadMoreItems() {
                var start = $scope.items.length;

                http.get('showPerRent', {
                    start: start,
                    length: step
                }).success(function (response, status, headers, config) {

                    angular.forEach(response.data, function (element) {
                        $scope.items.push(element);
                        $scope.hasMoreData = true;
                    });

                    //if ((response.data && response.data.length < step) || $scope.items.length == 0) {
                    //    $scope.hasMoreData = false;
                    //}

                    $scope.hasMoreData = response.data.length > 0;

                }).error(function (response) {
                    $scope.hasMoreData = false;
                });

                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

            $scope.showOrderDetails = function (orderId) {
                ez_state.go('orderDetails', {orderId: orderId})
            }


        }]);

angular.module('app.controllers').controller('orderDetailsController',
    ['$scope', 'app.api.http', '$stateParams', '$state', 'rentCarNewOrderService','$ionicPopup','$rootScope',
        function ($scope, http, $stateParams, $state, rentCarNewOrderService,$ionicPopup,$rootScope) {

            var param = angular.copy($stateParams)
            var commitParam = {
                orderId: null,
                perRentId: null,
                relationType: null
            }

            // 订单详情
            $scope.orderResult = {}

            $scope.$on('$ionicView.beforeEnter', function () {

                rentCarNewOrderService.reviewPerRent(param,function(data,pay,param){
                    console.log('订单预览请求返回数据data:'+JSON.stringify(data))
                    console.log('订单预览请求返回数据pay:'+JSON.stringify(pay))
                    console.log('订单预览请求返回数据param:'+JSON.stringify(param))
                    $scope.orderResult = data;
                    myPay.fee = pay.fee
                    myPay.balance = pay.account
                    commitParam = param
                })

                //http.get('reviewPerRent', param).success(function (data) {
                //    $scope.orderResult = data;
                //    var fee = actualFee
                //    var need =  needPrice - accountBalance
                //    var account = accountBalance - (needPrice - actualFee)
                //
                //    myPay.fee = fee
                //    myPay.account = account
                //
                //    //rentCarNewOrderService.reviewPerRent(data.summary.actualFee, data.summary.needPrice, data.summary.accountBalance)
                //    commitParam.orderId = data.orderInfo.orderId
                //    commitParam.perRentId = data.orderInfo.perRentId
                //    commitParam.relationType = data.orderInfo.relationType
                //    //$scope.$broadcast('reviewPerRent')
                //
                //});
            });

            $scope.showOrdersList = function () {
                $state.go('orders')
            }

            //$scope.commit = function () {
            //    console.log('支付未支付订单:' + JSON.stringify(commitParam))
            //    //rentCarNewOrderService.orderToPay(commitParam.orderId,commitParam.perRentId,commitParam.relationType)
            //    rentCarNewOrderService.orderToPay(commitParam.orderId, commitParam.perRentId, 'perRent')
            //}

            //todo
            /**
             reviewPerRent 接口方法返回的参数要补充几个

             data.summary.actualFee,
             data.summary.needPrice,
             data.summary.accountBalance

             data.orderInfo.orderId
             data.orderInfo.perRentId
             data.orderInfo.relationType

             其中:
             summary与perOrder接口方法中返回参数data.summary一致
             */
            var myPay = $scope.myPay = {
                fee:0,
                balance:0,
                submit:function(pay){
                    var params = {
                        orderId:commitParam.orderId,
                        perRentId:commitParam.perRentId,
                        relationId:commitParam.perRentId,
                        relationType:'perRent'
                    }
                    console.log('订单详情支付参数:'+JSON.stringify(angular.extend(params,pay)))
                    rentCarNewOrderService.orderToPay(params,pay,function(orderId){//ok
                        console.log('未支付订单,支付成功')
                        $ionicPopup.alert({
                            title: '提示',
                            template: '订单支付成功!',
                            okText: '确定'
                        }).then(function () {
                            $rootScope.go_url('orders');
                        });
                    },function(orderId,msg){//false
                        console.log('未支付订单,支付失败')
                        $ionicPopup.alert({
                            title: '提示',
                            template: msg?msg:'订单创建成功,但支付失败',
                            okText: '确定'
                        }).then(function(){
                            $rootScope.go_url('orders');
                        })
                    })
                }
            }

        }])


//angular.module('app.controllers')
//    .controller('reviewPerRentPayController',
//    ['$rootScope', '$scope', '$stateParams', 'rentCarNewOrderService', 'app.api.http', 'ENV', '$ionicPopup', '$state',
//        function ($rootScope, $scope, $stateParams, rentCarNewOrderService, http, ENV, $ionicPopup, $state) {
//
//            $scope.$on('$ionicView.beforeEnter', function () {
//                $scope.$broadcast('reviewPerRent')
//            })
//
//            var payShow = $scope.payShow = {
//                rest: {show: true, check: true, money: 0},
//                wx: {show: false, check: false, money: 0},
//                ali: {show: false, check: false, money: 0}
//            }
//
//            //2.支付方式限制
//            $scope.watch = function (e) {
//                var payMoney = rentCarNewOrderService.paySelect(e, payShow)
//                payShow.rest.money = payMoney.rest
//                payShow.wx.money = payMoney.other
//                payShow.ali.money = payMoney.other
//            }
//
//            $scope.$on('reviewPerRent', function () {
//                var payMoney = rentCarNewOrderService.paySelect({name: 'rest', selected: payShow.rest.check}, payShow)
//                payShow.rest.money = payMoney.rest
//                payShow.wx.money = payMoney.other
//                payShow.ali.money = payMoney.other
//            })
//
//
//        }])
