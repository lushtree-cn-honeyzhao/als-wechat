angular.module('app.controllers').controller('payJump',
    ['$rootScope', '$scope', 'app.api.http', '$filter', '$ionicPopup', '$state','$stateParams',
        function ($rootScope, $scope, http, $filter, $ionicPopup, $state,$stateParams) {

            //var model = $scope.model = {
            //    orderId:$stateParams.orderId
            //}
            ////存放订单id
            ////var orderId = $stateParams.orderId
            //
            //$scope.doRefresh = function () {
            //
            //    http.get("h5Pay", {
            //            body:'body',
            //            detail:'detail',
            //            attach:'attach',
            //            totalFee:'1',
            //            perRentOrderId:$scope.model.orderId
            //    }).success(function (data, status, headers, config) {
            //        if(data.status==200){//下单成功，得到后台的js数据，可以支付了
            //            console.log(data)
            //            /**
            //             * data.data中包含js代码的字符串数据
            //             * 执行微信支付控件，发起微信控件的支付请求
            //             * 请求发出后会回调固定的函数 h5pay()
            //             */
            //            eval(data.data)
            //            /**
            //             *  微信支付控件的回调
            //             *  json为控件返回的信息，包含用户是否支付成功，或者用户中途退出等
            //             *  parmas为返回支付需要的数据,调试使用
            //             */
            //            h5pay(function(json,parmas){
            //                //通过json判断控件的回调信息，确定是否支付成功，确定下一步页面的流程
            //                $ionicPopup.alert({
            //                    title: '支付控件回调',
            //                    template: JSON.stringify(json)+"<br>"+JSON.stringify(parmas),
            //                    okText: '确定'
            //                }).then(function () {
            //
            //                });
            //            })
            //        }else{//下单失败，没有得到后台的js数据
            //            $ionicPopup.alert({
            //                title: '很遗憾',
            //                template: '下单失败['+data.message+']',
            //                okText: '确定'
            //            }).then(function () {
            //
            //            });
            //        }
            //    }).finally(function(){
            //        $scope.$emit('scroll.refreshComplete');
            //    });
            //}

        }])
