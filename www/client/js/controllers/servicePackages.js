'use strict';

angular.module('app.controllers')
    .controller('ServicePackagesController',
    ['$state', '$scope', 'app.api.http', '$location', '$stateParams', '$ionicPopup', '$rootScope',
        function ($state, $scope, http, $location, $stateParams, $ionicPopup, $rootScope) {
            var model = $scope.model = {
                param: angular.copy($stateParams)
            }
            $scope.$on('$ionicView.beforeEnter', function () {
                loadItems();
            });

            $scope.usePackage = function (s) {
                if (s == "已使用") {
                    checkUsePackage()
                } else {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '提示',
                        template: '确定要开始使用该包月包吗?'
                    });
                    confirmPopup.then(function (res) {
                        if (res) {
                            http.get("enablePackage", {
                                userPackageId: model.param.packageId
                            })
                                .success(function (data) {
                                    if (data.status == 200) {
                                        loadItems();
                                        checkUsePackage()
                                    } else {
                                        $ionicPopup.alert({
                                            title: '提示',
                                            template: data.message,
                                            okText: '确定'
                                        })
                                    }
                                })
                        }
                    });
                }
            }

            $scope.showOrderDetails = function (orderId) {
                // $state.go('orderDetails', {orderId: orderId, type:'packOrder',packageId:model.param.packageId,rnd: Math.random() + "_" + new Date().getTime()})
                $rootScope.go_url('orderDetails', {
                    orderId: orderId
                })
            }
            $scope.backList = function () {
                $rootScope.go_url('myPackageList')
                // $state.go('myPackageList', {rnd: Math.random() + "_" + new Date().getTime()}, {reload: true})
            }
            $scope.doRefresh = function () {
                loadItems();
            }
            function checkUsePackage(){
                http.get("package_checkUserPackageState").success(function (data, status, headers, config) {
                    if (data.status == 200) {
                        if (data.check) {
                            $rootScope.go_url('rentCarNewOrder', {
                                userPackageId: model.param.packageId,
                                type: 'day'
                            })
                        } else {
                            $ionicPopup.alert({
                                title: '提示',
                                template: '很抱歉，周末不能使用包月包',
                                okText: '确定'
                            })
                        }
                    }
                })
            }

            function loadItems() {
                $scope.nullIdCss = {id1: "", id2: ""}
                $scope.nullCssAll = ""
                $scope.useDetails = []
                $scope.checkPack = null
                http.get("userPackageItem", {
                    userPackageId: model.param.packageId,
                    rnd: Math.random() + "_" + new Date().getTime()
                })
                    .success(function (response) {
                        if (response.userPackage[0].useState == '未使用') {
                            $scope.nullIdCss = {id1: "", id2: "nullIdItem"}
                            $scope.nullCssAll = ""
                        } else if (response.userPackage[0].useState == '已使用') {
                            $scope.nullIdCss = {id1: "nullIdItem", id2: ""}
                            $scope.nullCssAll = ""
                        } else {
                            $scope.nullCssAll = "nullItem"
                        }

                        $scope.checkPack = response.userPackage[0]
                        if (response.detailsList.length == 0) {
                            $scope.nullCss = "nullItem"
                        } else {
                            $scope.useDetails = []
                            angular.forEach(response.detailsList, function (element) {
                                $scope.useDetails.push(element);
                            });
                            $scope.nullCss = ""
                        }
                    });
            }

        }])

/**
 * 我的包月包列表
 */
angular.module('app.controllers')
    .controller('MyPackListController',
    ['$state', '$scope', 'app.api.http', '$ionicPopup','$rootScope','Storage',
        function ($state, $scope, http, $ionicPopup,$rootScope,Storage) {
            $scope.nullClass = "nullItem"
            $scope.packages = []

            //debugger关键字，相当于断点
            //debugger
            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.nullClass = "nullItem"
                $scope.packages = []
                loadItems2();
            });

            $scope.showDetail = function (id) {
                $rootScope.go_url('myServicePackages', {
                    packageId: id
                })
            }
            $scope.doRefresh = function () {
                $scope.nullClass = "nullItem"
                $scope.packages = []
                loadItems2();

            }
            $scope.goBuyPack = function () {
                if(Storage.getUserInfo() ){
                    if (Storage.getUserInfo().approveStatusStr=='审核通过'){
                        $rootScope.go_url('buyDayPack')
                    }else{
                        $ionicPopup.alert({
                            title: '提示',
                            // template:Storage.getUserInfo().approveStatusStr+'...无法购买' ,
                            template:'亲，证件审核通过后才能购买' ,
                            okText: '确定'
                        })
                    }
                }

            }

            function loadItems2() {
                http.get("userProductPackageList", {rnd: Math.random() + "_" + new Date().getTime()})
                    .success(function (response) {
                        angular.forEach(response.data, function (element) {
                            $scope.packages.push(element);
                        });
                        if ($scope.packages.length == 0) {
                            $scope.nullClass = ""
                        }
                    });
            }

        }])
/**
 * 首页购买包月包
 */
angular.module('app.controllers')
    .controller('BuyPackageController',
    ['$state', '$scope', 'app.api.http','$rootScope',
        function ($state, $scope, http,$rootScope) {
            //var urlpackList = ENV.api + 'productPackage/packageList.json?authcode=' + Storage.getAccessToken().authcode;
            //$http.get(urlpackList)
            http.get("buyPackage")
                .success(function (response) {
                    angular.forEach(response.data, function (element) {
                        if (element.timeType == '包月白天') {
                            //var url = ENV.api + 'productPackage/packageDetails?packageId=' + element.id + '&authcode=' + Storage.getAccessToken().authcode;
                            //$http.get(url)
                            http.get("packageDetails", {packageId: element.id})
                                .success(function (a) {
                                    $scope.dayTimePack = a.package[0]
                                });
                        }
                    })
                })
            //$scope.buyPack = function (packId) {
            //    $rootScope.go_url('packageOrder', {
            //        packId: packId
            //    })
            //}
        }]);

/**
 * 首页购买包月包-包月下单
 */
angular.module('app.controllers')
    .controller('PackageOrderController',
    ['$state', '$scope', 'app.api.http', '$location', '$stateParams', '$ionicPopup','$rootScope',
        function ($state, $scope, http, $location, $stateParams, $ionicPopup,$rootScope) {
            var model = $scope.model = {
                param: angular.copy($stateParams)
            }
            //var url1 = ENV.api + 'productPackage/packageDetails.json?packageId=' + model.param.packId + '&authcode=' + Storage.getAccessToken().authcode;
            //$http.get(url1)
            http.get("packageDetails", {packageId: model.param.packId})
                .success(function (response) {
                    $scope.checkedPack = response.package[0]
                    $scope.accountPay = response.package[0].price
                    $scope.accountPayDefinte = response.package[0].price
                });
            model.cou = {couId: ''};

            //var url2 = ENV.api + 'coupon/useful.json?authcode=' + Storage.getAccessToken().authcode;
            //$http.get(url2)
            http.get("useful")
                .success(function (response) {
                    $scope.coupNo = response.size
                    $scope.coupons = []
                    angular.forEach(response.list, function (element) {
                        $scope.coupons.push(element);
                    });
                });

            $scope.$watch('model.cou.couId', function () {
                $scope.accountPay = $scope.accountPayDefinte
                //var url4 = ENV.api + 'userCoupon/show2.json?id=' + model.cou.couId + '&authcode=' + Storage.getAccessToken().authcode;
                //$http.get(url4)
                http.get("userCoupon", {id: model.cou.couId})
                    .success(function (data) {
                        if (data.cou != null) {
                            model.cou.couId = data.cou.id
                            if (data.cou.couponPar <= $scope.accountPay) {
                                $scope.accountPay = $scope.accountPay - data.cou.couponPar
                            } else {
                                $scope.accountPay = 0.0
                            }
                        }
                    })
            })


            $scope.buy = function () {
                //var url5 = ENV.api + 'productPackage/createUserPackage?userCouponId=' + model.cou.couId + '&packageId=' + model.param.packId + '&authcode=' + Storage.getAccessToken().authcode;
                //$http.get(url5)
                http.get("createUserPackage", {
                    userCouponId: model.cou.couId,
                    packageId: model.param.packId
                }).success(function (data) {
                    if (data.status == -1) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: data.message,
                            okText: '确定'
                        })
                    } else {

                        //var url6 = ENV.api + 'productPackage/paymentUserPackage?userPackageId=' + data.userPackageId + '&authcode=' + Storage.getAccessToken().authcode;
                        //$http.get(url6)
                        http.get("paymentUserPackage", {
                            userPackageId: data.userPackageId
                        })
                            .success(function (data) {
                                var alertPopup = $ionicPopup.alert({
                                    title: '提示',
                                    template: data.message
                                });
                                alertPopup.then(function (res) {
                                    if (data.status > 0) {
                                        $rootScope.go_url('myPackageList')
                                    } else if(data.message.indexOf("请先充值") >= 0 ){
                                        $rootScope.go_url('usercenterAccountRecharge')
                                    }else{

                                    }
                                });
                            })
                    }
                })
            }
            $scope.backList = function () {
                $rootScope.go_url('buyDayPack')
            }
        }])




