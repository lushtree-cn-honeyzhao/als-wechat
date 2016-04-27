'use strict';

angular.module('app.controllers').controller('RentCarNewOrderController',
    ['$scope', 'app.api.http', 'dateFilter', '$state', '$rootScope', '$stateParams', '$ionicPopup', 'rentCarNewOrderService', '$filter', 'rentService','datePickerService','Storage',
        function ($scope, http, dateFilter, $state, $rootScope, $stateParams, $ionicPopup, rentCarNewOrderService, $filter, rentService,datePickerService, Storage) {

            console.log("$stateParams.type:" +$stateParams.type)

            var initTime = rentService.initTime($stateParams.type)
            var carConditionModel = $scope.carConditionModel = {
                points: [],
                time: initTime.value,//time:{from:new Date(),to:new Date()},
                timeLimit:{min:new Date(initTime.value.from.getTime()-1)},
                type: $stateParams.type,
                userPackageState: false,
                selectPoint:{}
            };


            $scope.carListModel = {
                type: $scope.carConditionModel.type,
                cars: [],
                brands: [],
                selectBrand: {}
            };


            // 初始化数据
            $scope.initData = function(){
                if($stateParams.type == 'day'){
                    // 检查是否有优惠包
                    //if(Storage.authenticated()){
                        rentService.getUserPackageState(function (data){
                            $scope.carConditionModel.userPackageState = data.check;
                        })
                    //}
                }

                $scope.selectFromTime = function(){
                    datePickerService.openPicker(function(date){
                        carConditionModel.time.from = date
                        carsList('selectFromTime change',true)
                    },{min:carConditionModel.timeLimit.min})
                }

                //$scope.to = {view:initTime.view.to}
                $scope.selectToTime = function(){
                    datePickerService.openPicker(function(date){
                        carConditionModel.time.to = date
                        carsList('selectToTime change',true)
                    },{min:carConditionModel.timeLimit.min})
                }

                rentService.findGuideList(function (data) {
                    $scope.carConditionModel.points = data.list;
                    $scope.carConditionModel.selectPoint = $scope.carConditionModel.points[0]
                    carsList( 'initData findGuideList')
                })
            }

            $scope.$on('$ionicView.beforeEnter', function () {
                console.log('$ionicView.beforeEnter')
                //$scope.initData();//不能放在beforeEnter中初始化数据，会导致每次选时间会把网点数据清空

            });

            $scope.initData();

            $scope.$watch('carConditionModel.selectPoint', function (selectPoint) {
                console.log('$watch.carConditionModel.selectPoint')
                 carsList('$watch carConditionModel.selectPoint')
            })

            $scope.doRefresh = function () {
                console.log('refresh...')
                carsList('doRefresh')
                //$scope.$apply()
            }

            /**
             *
             * @param needChecktime 只有时间变了才检查时间。否则会刷新多次，造成对话框点不掉。
             * @returns {boolean}
             */
            function carsList(src,needChecktime) {
                console.log("src:" + src)
                var result = rentService.listChecktime($stateParams.type,carConditionModel.time.from,carConditionModel.time.to)
                if(needChecktime){
                    if(result != true){
                        $ionicPopup.alert(result);
                        return false;
                    }
                }
                if ($scope.carConditionModel.selectPoint && $scope.carConditionModel.selectPoint.id)
                    //获取车辆信息,发送到车列表
                    rentService.getCarsList(
                        $scope.carConditionModel.selectPoint.id,
                        dateFilter($scope.carConditionModel.time.from,'yyyy-MM-dd HH:mm'),
                        dateFilter($scope.carConditionModel.time.to,'yyyy-MM-dd HH:mm'),
                        //$scope.carConditionModel.time.from,
                        //$scope.carConditionModel.time.to,
                        function (data) {
                            //填充品牌和车列表
                            //$scope.carListModel.selectBrand = {vehicleLicense: '全部型号', all: true}
                            $scope.carListModel.cars = data.list
                            $scope.carListModel.brands = [].concat({brand: '全部', all: true},
                                rentService.getBrands(data.list))
                            $scope.carListModel.selectBrand = $scope.carListModel.brands[0]
                        },
                        function () {
                            $scope.$broadcast('scroll.refreshComplete');
                        })
            }


            $scope.selectCar = function (car) {

                var params = {
                    car: angular.copy(car),
                    time: {
                        // 时间变成String 传递.
                        from: dateFilter($scope.carConditionModel.time.from,'yyyy-MM-dd HH:mm'),
                        to: dateFilter($scope.carConditionModel.time.to,'yyyy-MM-dd HH:mm')
                    },
                    selectPoint: angular.copy($scope.carConditionModel.selectPoint),
                    type: angular.copy($scope.carConditionModel.type),
                    parentRnd: $stateParams.rnd,
                    userPackageState: angular.copy($scope.carConditionModel.userPackageState)
                }

                rentCarNewOrderService.setSelectCarParams(params);

                /**
                 * 选车时间验证
                 * 车根据初始时间展示后,在用户选车的时候还要做限制
                 */
                var checkResult = rentService.checktime($stateParams.type,carConditionModel.time.from,carConditionModel.time.to)
                if(checkResult==true){
                    //选车拦截
                    http.post('beforePerRent',{}).success(function(data){
                        if($scope.carConditionModel.userPackageState && car.vehicleVersionName!='奇瑞EQ'){
                            $ionicPopup.alert({
                                title: '提示',
                                template: "你的包月包只能租用"+"奇瑞EQ"+"的车",
                                okText: '确定'
                            })
                            return false
                        }
                        if(data.status == '200'){
                            $state.go('rentCarPreviewOrder', {type:$scope.carConditionModel.type, rnd:Math.random() +"_"+ new Date().getTime()});
                        }else if(data.status == '-1'){
                            $ionicPopup.alert({
                                template: data.message,
                                okText: '确定'
                            }).then(function () {
                                $state.go('usercenterAccountRecharge')
                            });
                        }else if(data.status == '-2'){
                            $ionicPopup.alert({
                                template: data.message,
                                okText: '确定'
                            }).then(function () {
                                $state.go('signupUpload')
                            });
                        }
                    })

                }else{
                    $ionicPopup.alert(checkResult)
                }
            }
        }]);