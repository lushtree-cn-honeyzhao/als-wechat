/**
 * Created by cc on 15-8-7.
 */
angular.module('app.services').factory('h5pay',
    ['app.api.http', '$ionicPopup', 'loginWithCode', 'ENV', 'wx',
        function (http, $ionicPopup, loginWithCode, ENV, wx) {

            /**
             * 支付方式一，使用 WeixinJSBridge 方式調用
             * 先调方式一后可以调起方式二
             * 先掉方式二后，不能调起方式一
             * 两种方式不兼容
             * @param data
             */
            function pay1(data, ok, cancel, fail) {
                /**
                 * data.data中包含js代码的字符串数据
                 * 执行微信支付控件，发起微信控件的支付请求
                 * 请求发出后会回调固定的函数 h5pay()
                 */
                eval('(window.h5pay=' + data.data + ')')
                /**
                 *  微信支付控件的回调
                 *  json为控件返回的信息，包含用户是否支付成功，或者用户中途退出等
                 *  parmas为返回支付需要的数据,调试使用
                 */
                if (angular.isFunction(window.h5pay)) {
                    window.h5pay(function (json, parmas) {
                        if (json.status == 0) {//浏览器不支持
                            $ionicPopup.alert({
                                title: '浏览器不支持',
                                template: '请在微信中支付',
                                okText: '确定'
                            }).then(function () {
                                if (angular.isFunction(fail)) fail()
                            });
                            return
                        }
                        /**
                         * 调用支付控件成功，得到控件的返回信息,支付成功与否都放在err_msg中,
                         * 包括3中状态
                         *     get_brand_wcpay_request:ok        支付成功
                         *     get_brand_wcpay_request:cancel    支付过程中用户取消
                         *     get_brand_wcpay_request:fail        支付失败
                         */
                        if (json.response['err_msg'] == 'get_brand_wcpay_request:ok') {//支付成功,
                            if (angular.isFunction(ok)) ok()
                        } else if (json.response['err_msg'] == 'get_brand_wcpay_request:cancel') {//用户支付中途退出
                            if (angular.isFunction(cancel)) cancel()
                        } else {
                            if (angular.isFunction(fail)) fail()
                        }
                    })
                } else {
                    $ionicPopup.alert({
                        title: '支付失败',
                        template: '重新支付',
                        okText: '确定'
                    }).then(function () {
                        if (angular.isFunction(fail)) fail()
                    });
                }

            }

            /**
             * 支付方式二，使用 wx.chooseWXPay 方式调用
             * 先调方式一后可以调起方式二
             * 先掉方式二后，不能调起方式一
             * 两种方式不兼容
             * @param data
             */
            function pay2(data, ok, cancel, fail) {
                console.log('开始调用支付控件wx.chooseWXPay，首先获取wx')
                wx.wx(function (wxObj) {
                    console.log('获取到wx,开始执行wx.chooseWXPay')
                    wxObj.chooseWXPay({
                        timestamp: data.config.timestamp,   // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                        nonceStr: data.config.nonceStr,     // 支付签名随机串，不长于 32 位
                        package: data.config.package,       // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                        signType: data.config.signType,     // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                        paySign: data.config.paySign,       // 支付签名
                        success: function (res) {//接口调用成功时执行的回调函数
                            console.log('执行wx.chooseWXPay后success回调:'+JSON.stringify(res))
                            if (angular.isFunction(ok)) {
                                ok(res)
                            }else{
                                $ionicPopup.alert({
                                    title: '支付成功',
                                    template: JSON.stringify(res),
                                    okText: '确定'
                                })
                            }
                        },
                        fail: function (res) {//接口调用失败时执行的回调函数
                            console.log('执行wx.chooseWXPay后fail回调:'+JSON.stringify(res))
                            if (angular.isFunction(fail)){
                                fail(res)
                            }else{
                                $ionicPopup.alert({
                                    title: '支付失败',
                                    template: JSON.stringify(res),
                                    okText: '确定'
                                })
                            }
                        },
                        complete: function (res) { //接口调用完成时执行的回调函数，无论成功或失败都会执行
                            console.log('执行wx.chooseWXPay后complete回调:'+JSON.stringify(res))
                        },
                        cancel: function (res) {//用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到
                            console.log('执行wx.chooseWXPay后cancel回调:'+JSON.stringify(res))
                            if (angular.isFunction(cancel)){
                                cancel(res)
                            }else{
                                $ionicPopup.alert({
                                    title: '支付中断',
                                    template: JSON.stringify(res),
                                    okText: '确定'
                                })
                            }
                        }
                    });
                }, function (res) {
                    console.log('获取wx失败,支付控件调用失败'+res)
                    $ionicPopup.alert({
                        title: '支付控件调用失败',
                        template: JSON.stringify(res),
                        okText: '确定'
                    }).then(function () {

                    });
                })
            }

            function pay(payfn, money, body, detail, attach, ok, cancel, fail, params) {
                var inputParams1 = {
                    body: body,
                    detail: detail || 'detail',
                    attach: attach || 'attach',
                    totalFee: money
                }
                console.log('h5Pay inputParams1:'+JSON.stringify(inputParams1))
                var inputParams2 = angular.extend(inputParams1, params)
                console.log('h5Pay inputParams2:'+JSON.stringify(inputParams2))
                http.post("h5Pay", loginWithCode.addOpenId(inputParams2)).success(function (data) {
                    if (data.status == 200) {//请求后台支付成功了
                        console.log('请求后台支付成功了,开始客户端支付')
                        payfn(data, ok, cancel, fail)
                    } else {//请求后台支付失败了
                        $ionicPopup.alert({
                            title: '对不起',
                            template: data.message,
                            okText: '确定'
                        }).then(function () {

                        });
                    }
                }).finally(function () {
                    $scope.$emit('scroll.refreshComplete');
                });
            }

            return {
                quickPay: function (money, body, detail, attach, ok, cancel, fail) {
                    pay(pay1, money, body, detail, attach, ok, cancel, fail)
                },
                pay: function (money, body, detail, attach, ok, cancel, fail) {
                    pay(pay2, money, body, detail, attach, ok, cancel, fail)
                },
                payOrder: function (params, ok, cancel, fail) {
                    pay(pay2, params.money, params.body, params.detail, params.attach, ok, cancel, fail, params)
                }
            }
        }

    ])
;