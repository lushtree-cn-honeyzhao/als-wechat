/**
 * Created by cc on 15-8-4.
 */

angular.module('app.services').factory('rentCarNewOrderService',
    ['Storage', 'h5pay', '$window', 'app.api.http', '$state', '$ionicPopup','$rootScope',
        function (Storage, h5pay, $window, http, $state, $ionicPopup,$rootScope) {

            // 选车页面的参数
            var selectCarParams = {};

            var postParams = null

            function moneyFilter(money){
                var m = angular.copy(money+'')
                m = m.replace('￥','').replace(',','')
                m = parseFloat(m.toString())
                return m
            }

            /**
             * 订单预览,then构造payWay
             * @param fn
             */
            function perOrder(fn,callback) {
                http.post("perOrder", postParams).success(function (data, status, headers, config) {
                    console.info(JSON.stringify(data))
                    fn(data)
                    var actualFee =moneyFilter(data.summary.actualFee)              //租金
                    var needPrice = moneyFilter(data.summary.needPrice)             //租金 + 保证金
                    var accountBalance = moneyFilter(data.summary.accountBalance)   //可用余额 + 保证金
                    /**
                     * @param fee         租车费用
                     * @param need        需要额外付的钱=可用余额-租车费用
                     * @param account     可用余额
                     */
                    var fee = actualFee
                    var need =  needPrice - accountBalance
                    var account = accountBalance - (needPrice - actualFee)
                    //payWay.configMoney(fee, need, account)
                    callback(fee,account)
                })
            }


            function toPay(params,myPay,ok,fail){
                //myPay = {"money":{"rest":50,"other":20},"fn":[0,1]}
                //orderId, money,relationId,relationType
                params.paymentType=''
                var pay;
                if(myPay.money.rest==0){
                    if(myPay.money.other==0){
                        params.paymentType = '0元支付'
                        pay = paymentByAccunt
                    }else{
                        params.paymentType = '在线支付'
                        params.money = myPay.money.other
                        pay = paymentByWx
                    }
                }else{
                    if(myPay.money.other==0){
                        params.paymentType = '余额支付'
                        pay = paymentByAccunt
                    }else{
                        params.paymentType = '余额支付+微信支付'
                        params.money = myPay.money.other
                        pay = paymentByWx
                    }
                }

                pay(params,ok,fail)
            }
            /**
             * 创建订单，then支付
             * @param postParams
             * @param payFn
             */
            function createPerRentToPay(postParams, myPay,ok,fail) {
                http.post("createPerRent", postParams).success(function (data, status, headers, config) {
                    console.log('createPerRent订单请求返回:'+data.status)
                    if (data.status == '200') {//预定成功
                        console.log('createPerRent预定成功')
                        if (postParams.isPackage) {
                            console.log('是优惠包,直接跳到订单明细')
                            $state.go('orderDetails', {orderId: data.item.orderId});
                        } else {
                            //这里分为余额支付 和 微信支付
                            //余额支付 paymentPerRent(orderId)
                            //微信支付 createPaymentOrder (orderId, money,relationId,relationType)
                            console.log('开始调用pay.fn->')
                            console.log('参数:'+'orderId->'+data.item.orderId)
                            console.log('参数:'+'relationId->'+data.item.perRentId)
                            console.log('参数:'+'money->'+myPay.money)
                            console.log('参数:'+'relationType->'+postParams.relationType)

                            var params = {}

                            params.orderId = data.item.orderId
                            params.money = myPay.money.other
                            params.relationId = data.item.perRentId
                            params.relationType = 'perRent'

                            toPay(params,myPay,ok,fail)
                        }
                    } else {
                        fail(null,data.message)
                        //$ionicPopup.alert({
                        //    title: '提示',
                        //    template: data.message,
                        //    okText: '确定'
                        //})
                    }
                })
            }

            /**
             * 微信支付
             * @param params = {orderId, money,relationId,relationType}
             * @param ok
             * @param fail
             */
            function paymentByWx(params,ok,fail) {
                console.log('createPaymentOrder:'+JSON.stringify({
                    orderId:params.orderId,
                    balance:params.money,
                    source:'wechat_h5',
                    relationType:params.relationType,
                    relationId:params.relationId
                }))
                http.post("createPaymentOrder",{
                    orderId:params.orderId,
                    balance:params.money,
                    source:'wechat_h5',
                    relationType:params.relationType,
                    relationId:params.relationId
                }).success(function (data) {
                    if (data.status == '200') {
                        console.log('createPaymentOrder返回:'+JSON.stringify(data))
                        console.log('开始h5支付:payOrderId:'+params.relationId+",money:"+params.money+'元,relationType:'+params.relationType)
                        var payParams = {
                            body: '租车订单',
                            detail: 'detail2',
                            attach: 'attach2',
                            totalFee: parseFloat(params.money+0.0).toFixed(2) * 100,
                            //totalFee: 1,
                            relationId:params.relationId,
                            relationType:params.relationType
                        }
                        console.log("h5支付参数:"+JSON.stringify(payParams))
                        h5pay.payOrder(payParams, function () {
                            console.log('支付回调success,点击确定后进入订单明细')
                            if(angular.isFunction(ok)){
                                ok(params.orderId)
                            }else{
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '订单支付成功!',
                                    okText: '确定'
                                }).then(function () {
                                    $rootScope.go_url('orders');
                                });
                            }
                        }, function () {
                            console.log('支付回调cancel,返回')
                            if(angular.isFunction(fail)){
                                fail(params.orderId)
                            }else{
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '订单支付中断!',
                                    okText: '确定'
                                }).then(function () {
                                    $rootScope.go_url('orders');
                                });
                            }
                        }, function () {
                            console.log('支付回调fail,返回')
                            if(angular.isFunction(fail)){
                                fail(params.orderId)
                            }else{
                                $ionicPopup.alert({
                                    title: '提示',
                                    template: '订单支付失败!',
                                    okText: '确定'
                                }).then(function () {
                                    $rootScope.go_url('orders');
                                });
                            }
                        })
                    }else{
                        console.log('createPaymentOrder返回意外')
                        if(angular.isFunction(fail)){
                            fail(null,data.message)
                        }else{
                            $ionicPopup.alert({
                                title: '提示',
                                template: '支付发生意外!',
                                okText: '确定'
                            }).then(function () {
                                $rootScope.go_url('orders');
                            });
                        }
                    }

                })
            }

            //余额支付
            function paymentByAccunt(params,ok,fail) {
                console.log('开始余额支付paymentPerRent')
                http.api('paymentPerRent', {orderId: params.orderId}).success(function (dataPayment, status, headers, config) {
                    if (dataPayment.status == 200) {//订单使用余额支付成功
                        console.log('余额支付成功')
                        ok(params.orderId)
                        //$ionicPopup.alert({
                        //    title: '提示',
                        //    template: '订单支付成功!',
                        //    okText: '确定'
                        //}).then(function () {
                        //    $rootScope.go_url('orderDetails', {orderId: orderId});
                        //});
                    } else {
                        console.log('余额支付失败')
                        fail(null,dataPayment.message)
                        //$ionicPopup.alert({
                        //    title: '提示',
                        //    template: dataPayment.message,
                        //    okText: '确定'
                        //});
                    }
                })
            }


            /**
             * 支付方式服务类
             * @type {{configMoney, needPayOnline, paySelect, getPayFn}}
             */
            //var payWay = (function () {
            //    //余额支付
            //    function paymentByAccunt(orderId) {
            //        console.log('开始余额支付paymentPerRent')
            //        http.api('paymentPerRent', {orderId: orderId}).success(function (dataPayment, status, headers, config) {
            //            if (dataPayment.status == 200) {//订单使用余额支付成功
            //                console.log('余额支付成功')
            //                $ionicPopup.alert({
            //                    title: '提示',
            //                    template: '订单支付成功!',
            //                    okText: '确定'
            //                }).then(function () {
            //                    $rootScope.go_url('orderDetails', {orderId: orderId});
            //                });
            //            } else {
            //                console.log('余额支付失败')
            //                $ionicPopup.alert({
            //                    title: '提示',
            //                    template: dataPayment.message,
            //                    okText: '确定'
            //                });
            //            }
            //        })
            //    }
            //
            //    //微信支付
            //    function paymentByWx(orderId, money,relationId,relationType) {
            //        console.log('createPaymentOrder:'+JSON.stringify({
            //            orderId:orderId,
            //            balance:money,
            //            source:'wechat_h5',
            //            relationType:relationType,
            //            relationId:relationId
            //        }))
            //        http.post("createPaymentOrder",{
            //            orderId:orderId,
            //            balance:money,
            //            source:'wechat_h5',
            //            relationType:relationType,
            //            relationId:relationId
            //        }).success(function (data, status, headers, config) {
            //            if (data.status == '200') {
            //                console.log('createPaymentOrder返回:'+JSON.stringify(data))
            //                console.log('开始h5支付:payOrderId:'+relationId+",money:"+money+'元,relationType:'+relationType)
            //                h5pay.payOrder({
            //                    body: '租车订单',
            //                    detail: 'detail2',
            //                    attach: 'attach2',
            //                    totalFee: money * 100,
            //                    //totalFee: 1,
            //                    relationId:relationId,
            //                    relationType:relationType
            //                }, function () {
            //                    console.log('支付回调success,点击确定后进入订单明细')
            //                    $ionicPopup.alert({
            //                        title: '提示',
            //                        template: '订单支付成功!',
            //                        okText: '确定'
            //                    }).then(function () {
            //                        $rootScope.go_url('orderDetails', {orderId: orderId});
            //                    });
            //                }, function () {
            //                    console.log('支付回调cancel,返回')
            //                    $window.history.back()
            //                }, function () {
            //                    console.log('支付回调fail,返回')
            //                    $window.history.back()
            //                })
            //            }else{
            //                console.log('createPaymentOrder返回意外')
            //                $ionicPopup.alert({
            //                    title: '提示',
            //                    template: '支付发生意外',
            //                    okText: '确定'
            //                })
            //            }
            //
            //        })
            //    }
            //
            //    /**
            //     * @param fee         租车费用
            //     * @param need        需要额外付的钱=可用余额-租车费用
            //     * @param account     可用余额
            //     */
            //    var money = {
            //        actualFee: 0,
            //        needPrice: 0,
            //        accountBalance: 0
            //    }
            //    //用来计算要支付的钱
            //    var payMoney = {
            //        rest: 0,
            //        other: 0
            //    }
            //    //用来存放支付方式
            //    var way = {
            //        rest: true,//余额支付
            //        needPayOnline: false, //是否需要使用第三方在线支付
            //        other: {wx_h5: false, ali_h5: false} //微信h5支付，支付宝支付等第三方在线支付
            //    }
            //
            //    return {
            //        /**
            //         * @param fee         租车费用
            //         * @param need        需要额外付的钱=可用余额-租车费用
            //         * @param account     可用余额
            //         */
            //        configMoney: function (actualFee, needPrice, accountBalance) {
            //            money.actualFee = actualFee
            //            money.needPrice = needPrice
            //            money.accountBalance = accountBalance
            //            if (needPrice > 0) {
            //                way.needPayOnline = true
            //            } else {
            //                way.needPayOnline = false
            //            }
            //        },
            //        //是否需要额外在线支付
            //        needPayOnline: function () {
            //            return angular.copy(way.needPayOnline)
            //        },
            //        //用户选择支付方式后提交结果,比如余额支付，余额+微信支付，余额+支付宝等
            //        paySelect: function (e, payShow) {
            //            //用户选择支付按钮分两种限制情况
            //            if (way.needPayOnline) { //余额不够用 余额支付 必选 和 在线支付 任意选中其一
            //                //第一条规则:显示所有支付选项
            //                payShow.wx.show = true
            //                payShow.wx.check = true
            //                payShow.ali.show = true
            //                //第二条规则:必须选中除余额支付以外的一个在线支付选项
            //                if (e.name != 'rest') {
            //                    if (e.selected == true) {//选中事件
            //                        angular.forEach(payShow, function (v, k) {
            //                            if (k != e.name && k != 'rest') {
            //                                v.check = false
            //                            }
            //                        }, [])
            //                    } else {//取消选中事件
            //                        payShow[e.name].check = true
            //                    }
            //                }
            //                //第三条规则:如果余额为0,则禁止余额支付反选
            //                if(money.accountBalance<=0){
            //                    payShow.rest.check = true
            //                }
            //            } else {//余额够用 余额支付 和 在线支付 必须任意选中其一
            //                //第一条规则:
            //                // 余额支付选中后，隐藏在线支付,反选所有在线支付
            //                // 余额支付反选后，显示所有在线支付，默认显示微信支付，其他反选
            //                if (payShow.rest.check) {
            //                    payShow.wx.show = false
            //                    payShow.ali.show = false
            //                } else {
            //                    payShow.wx.show = true
            //                    payShow.ali.show = true
            //                    payShow.wx.check = true
            //                }
            //                //第二条规则:只能选中一个
            //                if (e.selected == true) {//选中事件
            //                    angular.forEach(payShow, function (v, k) {
            //                        if (k != e.name) {
            //                            v.check = false
            //                        }
            //                    })
            //                } else {//取消选中事件
            //                    e.selected = true
            //                }
            //            }
            //            way.rest = payShow['rest'].check
            //            way.other['wx_h5'] = payShow['wx'].check
            //            way.other['ali_h5'] = payShow['ali'].check
            //            //开始确定支付金额
            //            if (way.rest) {//使用了余额
            //                if (money.actualFee - money.accountBalance > 0) { //余额不够
            //                    payMoney.rest = money.accountBalance
            //                    payMoney.other = money.actualFee - money.accountBalance
            //                } else { //余额够用
            //                    payMoney.rest = money.actualFee
            //                    payMoney.other = 0
            //                }
            //            } else {//没有使用余额
            //                payMoney.rest = 0
            //                payMoney.other = money.actualFee
            //            }
            //            //另一条规则：如果费用为0则,选择余额支付，反选其他支付，并隐藏
            //            if(money.actualFee<=0){
            //                payShow['rest'].check = true
            //                payShow['wx'].check = false
            //                payShow['wx'].show = false
            //                payShow['ali'].check = false
            //                payShow['ali'].show = false
            //            }
            //            //设置按钮上的值
            //            return angular.copy(payMoney)
            //        },
            //        //根据用户选择支付方式后,得到支付函数
            //        getPay: function () {
            //            var result = {
            //                money: payMoney.other,
            //                fn: {}
            //            }
            //            if (payMoney.other == 0) {
            //                console.log('返回支付函数paymentByAccunt,余额支付:'+result.money)
            //                result.fn = paymentByAccunt
            //            } else {
            //                console.log('返回支付函数paymentByWx,余额:'+result.money)
            //                result.fn = paymentByWx
            //            }
            //            return result
            //        }
            //    }
            //})()
            function reviewPerRent(param,fn){
                http.get('reviewPerRent', param).success(function (data) {

                    var actualFee =moneyFilter(data.summary.actualFee)              //租金
                    var needPrice = moneyFilter(data.summary.needPrice)             //租金 + 保证金
                    var accountBalance = moneyFilter(data.summary.accountBalance)   //可用余额 + 保证金

                    var fee = actualFee
                    var need =  needPrice - accountBalance
                    var account = accountBalance - (needPrice - actualFee)

                    var myPay = {}
                    myPay.fee = fee
                    myPay.account = account



                    var commitParam = {}
                    commitParam.orderId = data.orderInfo.orderId
                    commitParam.perRentId = data.orderInfo.perRentId
                    commitParam.relationType = data.orderInfo.relationType

                    fn(data,myPay,commitParam)
                });
            }



            return {
                setSelectCarParams: function (inSelectCarParams) {
                    //selectCarParams = inSelectCarParams;
                    Storage.set('rentCarNewOrderService.selectCarParams', inSelectCarParams)
                },
                getSelectCarParams: function () {
                    selectCarParams = Storage.get('rentCarNewOrderService.selectCarParams');
                    return selectCarParams;
                },
                ///////////////////////////////////////////////////
                // 一键支付步骤
                ////////////////////////////////////////////////////
                /**
                 * 第一步:创建订单 和 预览订单 的参数
                 * @param params
                 */
                setPostParams: function (params) {
                    postParams = params
                },
                /**
                 * 第二步:订单预览
                 * 先 setPostParams 后订单预览
                 * @returns {*}
                 */
                perOrder: function () {
                    return perOrder(arguments[0],arguments[1])
                },
                /**
                 * 第三步:控制订单支付方式
                 * 依赖:b
                 * @returns {{configMoney, needPayOnline, paySelect, getPayFn}}
                 */
                //paySelect: function (e, payShow) {
                //    return payWay.paySelect(e, payShow)
                //},
                /**
                 * 第四步:创建订单,then 支付
                 * 先 setPostParams 后创建订单
                 * perRent 或 package
                 */
                //createOrder: function (relationType) {
                //    createPerRentToPay(postParams, payWay.getPay(),relationType)
                //},
                orderToSubmit :function(myPay,ok,fail){
                    createPerRentToPay(postParams, myPay,ok,fail)
                },
                ///////////////////////////////////////////////////
                // 未支付订单支付步骤
                ////////////////////////////////////////////////////
                /**
                 * 第一步:未支付订单预览结果
                 * @returns {*}
                 */
                reviewPerRent: function (param,callback) {
                    reviewPerRent(param,callback)
                },
                /**
                 * 支付未支付的订单
                 */
                orderToPay: function (params,myPay,ok,fail) {
                    //var pay = payWay.getPay()
                    //console.log('orderToPay:'+JSON.stringify(pay))
                    //pay.fn(
                    //    orderId,
                    //    pay.money,
                    //    perRentId,
                    //    relationType,
                    //    callback
                    //)
                    toPay(params,myPay,ok,fail)
                }
            };


        }]);
