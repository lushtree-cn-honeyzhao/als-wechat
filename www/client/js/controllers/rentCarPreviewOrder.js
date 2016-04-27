'use strict';

/**
 * 预览订单
 *
 *      1.订单预览
 *      2.支付方式选择限制
 *      3.用户选择支付方式
 *      4.用户支付
 *
 */
angular.module('app.controllers')
    .controller('RentCarPreviewOrderController',
    ['$rootScope', '$scope', '$stateParams', 'rentCarNewOrderService', 'app.api.http', 'ENV', '$ionicPopup', '$state',
        function ($rootScope, $scope, $stateParams, rentCarNewOrderService, http, ENV, $ionicPopup, $state) {

            $scope.selectCarParams = {};
            $scope.orderResultStr = '';
            $scope.orderResult = {items: []};
            $scope.selectedCoupon = {id: ''};
            $scope.canUsePackage = false;
            // 包月包只在白天使用。
            $scope.selectedPayType = false;


            $scope.initData = function(){
                $scope.selectCarParams = rentCarNewOrderService.getSelectCarParams();

                $scope.orderResultStr = '';

                $scope.orderResult = {items: []};
                $scope.selectedCoupon = {id: ''};

                $scope.canUsePackage = $scope.selectCarParams.userPackageState;
                // 包月包只在白天使用。
                $scope.selectedPayType = {isPackage: $scope.canUsePackage};

            }

            if (ENV.debug) {
                console.log(JSON.stringify($scope.selectCarParams))
            }

            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.initData();
                $scope.showAmount();
                $scope.showCoupons();

            });

            $scope.showCoupons = function () {
                http.get("useful")
                    .success(function (response) {
                        $scope.coupNo = response.size
                        $scope.coupons = []
                        angular.forEach(response.list, function (element) {
                            $scope.coupons.push(element);
                        });
                    });
            }
            $scope.$watch('selectedCoupon.id', function () {
                $scope.showAmount();
            });
            $scope.$watch('selectedPayType.isPackage', function () {

                console.log("selectedPayType.isPackage:" + $scope.selectedPayType.isPackage)
                $scope.showAmount();
            });
            $scope.defind = function(){
                $scope.selectedPayType.isPackage=$scope.canUsePackage
            }

            /**
             * 提交订单的参数
             */
            function getPostParams() {
                var paymentType = ""
                if ($scope.selectedPayType.isPackage) {
                    paymentType = 'package'
                    $scope.selectedCoupon.id = ''
                } else {
                    paymentType = 'online'
                }
                var result = {
                    fetchSite: $scope.selectCarParams.selectPoint.id,
                    returnSite: $scope.selectCarParams.selectPoint.id,
                    vehVerId: $scope.selectCarParams.car.vehicleVersion,
                    startDate: $scope.selectCarParams.time.from,
                    endDate: $scope.selectCarParams.time.to,
                    couponCode: $scope.selectedCoupon.id,
                    paymentType: paymentType,
                    //serviceIds: '',
                    //userPackageId: '',
                    vehicleInfoId: $scope.selectCarParams.car.id,

                    isPackage:$scope.selectedPayType.isPackage,

                    relationType:''
                }
                rentCarNewOrderService.setPostParams(result)
                return result
            }

            /**
             * 预览订单金额
             */

            var myPay = $scope.myPay = {
                fee:0,
                balance:0,
                submit:function(){
                    rentCarNewOrderService.orderToSubmit(arguments[0],function(orderId){//ok
                        var msg = {
                            title: '提示',
                            template: '订单支付成功!',
                            okText: '确定'
                        }
                        if($scope.selectCarParams.type == 'night') {
                            msg['template'] = '支付成功，请您在20：30之前前往1+1大厦网点取车!'
                        }
                        $ionicPopup.alert(msg).then(function () {
                            $rootScope.go_url('orders');
                        });
                    },function(orderId,msg){//false
                        if(orderId == null){
                            $ionicPopup.alert({
                                title: '提示',
                                template: msg?msg:'订单创建失败',
                                okText: '确定'
                            })
                        }else{
                            $ionicPopup.alert({
                                title: '提示',
                                template: msg?msg:'订单创建成功,但支付失败',
                                okText: '确定'
                            }).then(function(){
                                $rootScope.go_url('orders');
                            })
                        }
                    })
                }
            }

            $scope.showAmount = function () {
                getPostParams()
                //1.订单预览
                rentCarNewOrderService.perOrder(function (data) {
                    $scope.orderResult = data;
                },function(fee,balance){
                    myPay.fee = fee;
                    myPay.balance = balance;
                    //$scope.$broadcast('perOrder')
                })

            }

            /**
             * 提交订单
             */
            //todo
            //$scope.orderSubmit = function () {
            //
            //
            //    var postParams = getPostParams();
            //
            //    http.post("createPerRent", postParams).success(function (data, status, headers, config) {
            //
            //        $scope.orderResultStr = JSON.stringify(data);
            //
            //        if (data.status == '200') {//预定成功
            //
            //            if ($scope.selectedPayType.isPackage) {
            //                $state.go('orderDetails', {orderId: data.item.orderId});
            //            } else {
            //                //余额支付
            //                http.api('paymentPerRent', {orderId: data.item.orderId}).success(function (dataPayment, status, headers, config) {
            //
            //                    if (dataPayment.status == 200) {//订单使用余额支付成功
            //                        $ionicPopup.alert({
            //                            title: '提示',
            //                            template: '订单支付成功!',
            //                            okText: '确定'
            //                        }).then(function () {
            //                            $state.go('orderDetails', {orderId: data.item.orderId});
            //                        });
            //                    } else {
            //                        $ionicPopup.alert({
            //                            title: '提示',
            //                            template: dataPayment.message,
            //                            okText: '确定'
            //                        });
            //                    }
            //                })
            //            }
            //        } else {
            //            $ionicPopup.alert({
            //                title: '提示',
            //                template: data.message,
            //                okText: '确定'
            //            })
            //        }
            //
            //    })
            //}

        }

    ])




//angular.module('app.controllers')
//    .controller('RentCarPreviewPayController',
//    ['$rootScope', '$scope', '$stateParams', 'rentCarNewOrderService', 'app.api.http', 'ENV', '$ionicPopup', '$state',
//        function ($rootScope, $scope, $stateParams, rentCarNewOrderService, http, ENV, $ionicPopup, $state) {

            //var payShow = $scope.payShow = {
            //    rest: {show: true, check: true,money:0},
            //    wx: {show: false, check: false,money:0},
            //    ali: {show: false, check: false,money:0}
            //}
            //
            ////2.支付方式限制
            //$scope.watch = function (e) {
            //    var payMoney = rentCarNewOrderService.paySelect(e,payShow)
            //    payShow.rest.money = payMoney.rest
            //    payShow.wx.money = payMoney.other
            //    payShow.ali.money = payMoney.other
            //}
            //
            //$scope.$on('perOrder',function(){
            //    var payMoney = rentCarNewOrderService.paySelect({name:'rest',selected:payShow.rest.check},payShow)
            //    payShow.rest.money = payMoney.rest
            //    payShow.wx.money = payMoney.other
            //    payShow.ali.money = payMoney.other
            //})
            //
            ////3.支付方式选择,这里使用父scope中的commit方法,类似多态的效果
            //$scope.commit = function () {
            //    rentCarNewOrderService.createOrder('perRent')
            //}


        //}])