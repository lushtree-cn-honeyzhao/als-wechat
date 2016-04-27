angular.module('app.directives').directive('myPay', function () {

    /**
     * 支付方式服务类
     * @type {{configMoney, needPayOnline, paySelect, getPayFn}}
     */
    var payWay = (function () {
        /**
         * 用来存放scope中的值
         * @type {{rest: {show: boolean, check: boolean, money: number}, wx: {show: boolean, check: boolean, money: number}, ali: {show: boolean, check: boolean, money: number}}}
         */
        //var payShow = {
        //    rest: {show: true, check: true, money: 0},
        //    wx: {show: false, check: false, money: 0},
        //    ali: {show: false, check: false, money: 0}
        //}
        /**
         * @param fee         租车费用
         * @param account     可用余额
         */
        var money = {
            actualFee: 0,
            accountBalance: 0
        }
        //用来计算要支付的钱
        var payMoney = {
            rest: 0,
            other: 0
        }
        //用来存放支付方式
        var way = {
            rest: true,//余额支付
            needPayOnline: false, //是否需要使用第三方在线支付
            other: {wx_h5: false, ali_h5: false} //微信h5支付，支付宝支付等第三方在线支付
        }

        return {
            /**
             * @param fee         租车费用
             * @param account     可用余额
             */
            configMoney: function (actualFee, accountBalance) { //转换为分
                money.actualFee = (actualFee+0.0).toFixed(2)*100
                money.accountBalance = (accountBalance+0.0).toFixed(2)*100
                console.log('configMoney:')
                console.log('租车费用(分):'+actualFee)
                console.log('可用余额:(分)'+accountBalance)
                if (accountBalance - actualFee < 0) {
                    way.needPayOnline = true
                } else {
                    way.needPayOnline = false
                }
                return this.initSelect()
            },
            //视图的初始化
            initSelect: function () {
                var payShow;
                if (way.needPayOnline){
                    payShow = {//默认微信支付 + 余额支付
                        "rest": {"show": true, "check": true, money: 0},
                        "wx": {"show": true, "check": true, money: 0},
                        "ali": {"show": true, "check": false, money: 0}
                    }
                }else{
                    payShow = {//余额支付
                        "rest": {"show": true, "check": true, money: 0},
                        "wx": {"show": false, "check": false, money: 0},
                        "ali": {"show": false, "check": false, money: 0}
                    }
                }
                return this.paySelect({name: "rest", selected: true}, payShow)
            },
            //用户选择支付方式后提交结果,比如余额支付，余额+微信支付，余额+支付宝等
            paySelect: function (e, payShow) {
                //用户选择支付按钮分两种限制情况
                if (way.needPayOnline) { //余额不够用 余额支付 必选 和 在线支付 任意选中其一
                    //第一条规则:显示所有支付选项
                    payShow.wx.show = true
                    payShow.wx.check = true
                    payShow.ali.show = true
                    //第二条规则:必须选中除余额支付以外的一个在线支付选项
                    if (e.name != 'rest') {
                        if (e.selected == true) {//选中事件
                            angular.forEach(payShow, function (v, k) {
                                if (k != e.name && k != 'rest') {
                                    v.check = false
                                }
                            }, [])
                        } else {//取消选中事件
                            payShow[e.name].check = true
                        }
                    }
                    //第三条规则:如果余额为0,则禁止余额支付反选
                    if (money.accountBalance <= 0) {
                        payShow.rest.check = true
                    }
                } else {//余额够用 余额支付 和 在线支付 必须任意选中其一
                    //第一条规则:
                    // 余额支付选中后，隐藏在线支付,反选所有在线支付
                    // 余额支付反选后，显示所有在线支付，默认显示微信支付，其他反选
                    if (payShow.rest.check) {
                        payShow.wx.show = false
                        payShow.ali.show = false
                    } else {
                        payShow.wx.show = true
                        payShow.ali.show = true
                        payShow.wx.check = true
                    }
                    //第二条规则:只能选中一个
                    if (e.selected == true) {//选中事件
                        angular.forEach(payShow, function (v, k) {
                            if (k != e.name) {
                                v.check = false
                            }
                        })
                    } else {//取消选中事件
                        e.selected = true
                    }
                }
                way.rest = payShow['rest'].check
                way.other['wx_h5'] = payShow['wx'].check
                way.other['ali_h5'] = payShow['ali'].check

                //开始确定支付金额
                if (way.rest) {//使用了余额
                    if (money.actualFee - money.accountBalance > 0) { //余额不够
                        payMoney.rest = money.accountBalance
                        payMoney.other = money.actualFee - money.accountBalance
                    } else { //余额够用
                        payMoney.rest = money.actualFee
                        payMoney.other = 0
                    }
                } else {//没有使用余额
                    payMoney.rest = 0
                    payMoney.other = money.actualFee
                }
                //另一条规则：如果费用为0则,选择余额支付，反选其他支付，并隐藏
                if (money.actualFee <= 0) {
                    payShow['rest'].check = true
                    payShow['wx'].check = false
                    payShow['wx'].show = false
                    payShow['ali'].check = false
                    payShow['ali'].show = false
                }
                //设置按钮上的值
                payShow.rest.money = (payMoney.rest/100).toFixed(2)
                payShow.wx.money = (payMoney.other/100).toFixed(2)
                payShow.ali.money = (payMoney.other/100).toFixed(2)
                return payShow
            },
            /**
             * 返回支付钱 和 支付方式
             * @returns {{money: number, fn: []}}
             *      number: 以元为单位
             *      fn: 0 为余额支付
             *          1 为微信支付
             *          2 为支付宝支付
             */
            getPay: function () {
                var result = {
                    money: angular.copy(payMoney),
                    fn: []
                }
                if (payMoney.other == 0) { //仅仅余额支付
                    result.fn = ['0']
                } else { //余额支付+其他支付 或 仅仅其他支付
                    if (payMoney.rest != 0) {//余额支付+其他支付
                        result.fn.push(0)
                    }
                    //其他支付
                    if (way.other['wx_h5']) {
                        result.fn.push(1)
                    } else if (way.other['ali_h5']) {
                        result.fn.push(2)
                    }
                }
                //console.log('<my-pay> result :'+JSON.stringify(result))
                result.money.rest =(payMoney.rest/100).toFixed(2)
                result.money.other = (payMoney.other/100).toFixed(2)
                console.log('<my-pay> callback :'+JSON.stringify(result))
                return result
            }
        }
    })()

    function link(scope, element, attrs) {
        scope.payShow = payWay.configMoney(scope.fee, scope.balance)
        scope.payFn = payWay.getPay()
        scope.watch = function (e) {
            payWay.paySelect(e, scope.payShow)
            scope.payFn = payWay.getPay()
        }
        scope.$watch('fee',function(n,o){
            if(n != o){
                scope.payShow = payWay.configMoney(scope.fee, scope.balance)
            }
        })
        scope.$watch('balance',function(n,o){
            if(n != o){
                scope.payShow = payWay.configMoney(scope.fee, scope.balance)
            }
        })
        scope.submit = function(){
            scope.callback({even: payWay.getPay()});
        }
    }

    return {
        restrict: 'E',
        scope: {
            fee: '=',
            balance: '=',
            callback:'&'
        },
        link: link,
        templateUrl: 'client/templates/common/myPay.ng.html'
    };

});

/**
 * 支付控件:

 template中添加标签:
     <my-pay fee='fee' balance='balance' callback="foo(even)" ></my-pay>
     <div><input ng-init="fee=3" ng-model="fee" placeholder="租车费用"></div>
     <div><input ng-init="balance=1" ng-model="balance" placeholder="可用余额"></div>

 controller中必须有3个绑定的值:
     $scope.fee = 2
     $scope.balance = 1
     $scope.foo = function (e) {
         console.log('test-------------------->:'+JSON.stringify(e))
     }

 点击提交后会回调$scope.foo方法,并传入支付相关的值

 */