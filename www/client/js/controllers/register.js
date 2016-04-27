/**
 * 用户注册
 */
angular.module('app.controllers').controller('RegisterController',
    ['$scope','$location','$ionicPopup','Storage','loginWithCode','app.api.http','ENV','$timeout','$state','$rootScope','$window',
    function ($scope,$location,$ionicPopup, Storage,loginWithCode,http,ENV,$timeout,$state,$rootScope,$window) {
        $scope.timer2 = '点击获取验证码';
        $scope.buttonFlag2 =''
        $scope.register = {phoneNum: '', vaildCode: '', userPassword: '', friendCode: '', checked:false};

        //$scope.$on('$ionicView.beforeEnter', function () {
        //    $scope.strRgeister = ""
        //    http.get("registerHelpContent", {title:'会员注册协议'}).success(function (response) {
        //        $scope.content = response.content
        //        if(response.content != null){
        //            $scope.strRgeister=response.content.content
        //        //var strs = response.content.content.split("\r\n")
        //        //for (var i = 0; i < strs.length; i++) {
        //        //    $scope.strRgeister += strs[i]
        //        //}
        //        }else{
        //            $scope.strRgeister+= '<span>1.通过注册方式获得阿拉善智能监控50元租车代金券（仅限新用户）；</span>'+'<br>'+
        //            '<span>2.代金券使用有效期为：代金券的过期日期内；</span>'+'<br>'+
        //            '<span>3.每笔订单只能使用一张代金券，每张代金券仅限使用一次，不叠加不拆分不找零；</span>'+'<br>'+
        //            '<span>4.使用非正常途径或手段获得的代金券奖励无效，阿拉善智能监控保留最终解释权。 </span>'+'<br>'
        //        }
        //    })
        //});

        // 邀请码
        $scope.initfriendCode = function(){
            var url = $location.url();
            var theReqRegister = new Object();
            if (url.indexOf("?") != -1) {
                var strs = url.split("?")
                for (var i = 0; i < strs.length; i++) {
                    if(strs[i].indexOf("&") != -1){
                        var strs2 = strs[i].split("&");
                            for (var j = 0; j < strs2.length; j++) {
                                theReqRegister[strs2[j].split("=")[0]] = (strs2[j].split("=")[1]);
                        }
                    }
                }
            }
            if(theReqRegister['invitedBy']){
                $scope.register.friendCode = theReqRegister['invitedBy'].replace('invitedby','')
            }
            // if(ENV.invitedBy){
            //    $scope.register.friendCode = ENV.invitedBy.replace('invitedby','')
            //}
        }
        $scope.initfriendCode();

        //发送验证码
        $scope.getValidCode = function (btnCss) {
            if ($scope.register.phoneNum == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入手机号!',
                    okText: '确定',
                    okType:btnCss

                })
                return;
            }
            var paramData = {
                phoneNum: $scope.register.phoneNum
            }
            http.post('sendRegVaildCode',paramData).success(function (data, status, headers, config) {
                    if (data.status > 0) {
                        $scope.buttonFlag2='disabled'
                        $ionicPopup.alert({
                            title: '提示',
                            template: data.message,
                            okText: '确定',
                            okType:btnCss
                        })
                        var updateClock = function (t) {
                            if (t >= 0) {
                                $timeout(function () {
                                    if(t>0){
                                        $scope.timer2 = t + '秒后，重新获取'}
                                    else{
                                        $scope.buttonFlag2=''
                                        $scope.timer2 = '点击获取验证码';
                                    }
                                    updateClock(t - 1)
                                }, 1000);
                            }
                        }
                        updateClock(60);

                    } else if (data.status <= 0) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: data.message,
                            okText: '确定',
                            okType:btnCss
                        })
                    }
                }).error(function (data, status, headers, config) {
                    alert('发生系统错误.');
                });
        }


        //用户注册
        $scope.onRegister = function (btnCss) {
            if($scope.register.checked){
            if ($scope.register.phoneNum == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入手机号码!',
                    okText: '确定',
                    okType:btnCss
                })
                return false;
            }
            if ($scope.register.vaildCode == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入验证码!',
                    okText: '确定',
                    okType:btnCss
                })
                return false;
            }

            if ($scope.register.userPassword == '') {
                $ionicPopup.alert({
                    title: '提示',
                    template: '请输入密码!',
                    okText: '确定',
                    okType:btnCss
                })
                return false;
            }
            var paramData = {
                phoneNum: $scope.register.phoneNum,
                vaildCode: $scope.register.vaildCode,
                userPassword: $scope.register.userPassword,
                friendCode: $scope.register.friendCode
            }
            http.post('register',loginWithCode.addOpenId(paramData)).success(function (data, status, headers, config) {
                    if (data.status > 0) {
                        console.log("register返回success数据:"+JSON.stringify(data))
                        var user = data.user;
                        Storage.setUserInfo(user);
                        Storage.setAccessToken(data.authInfo);

                        $ionicPopup.alert({
                            title: '提示',
                            template: data.message,
                            okText: '确定',
                            okType:btnCss
                        }).then(function(){
                            if(btnCss=='button-dcgj'){
                            $rootScope.go_url('dcgj_success')
                           //$window.location.href='http://mp.weixin.qq.com/s?__biz=MzA4MDU2NzM5OQ==&mid=211178263&idx=1&sn=5aa3ed434fac4229d84278ec90401622&scene=0#rd'
                            }else{
                            $rootScope.go_url('signupUpload',{uploadType:'fromRegister'})
                            }
                        })
                    } else if (data.status <= 0) {
                        $ionicPopup.alert({
                            title: '提示',
                            template: data.message,
                            okText: '确定',
                            okType:btnCss
                        })
                    }
                });
            }else{
                $ionicPopup.alert({
                    title: '提示',
                    template: '必须同意租车用户使用协议!',
                    okText: '确定',
                    okType:btnCss
                })
            }
        }

        $scope.showRegistLicence = function () {
            $rootScope.go_url('agreement')
            //var url = ENV.api + 'cms/mhelp/regist';
            //window.location = url;
        }


    }])
/**
 * 用户须知协议
 */
angular.module('app.controllers').controller('AgreementController',
    ['$scope','$stateParams','app.api.http',
        function ($scope,$stateParams,http) {
            $scope.registerType  = $stateParams.registerType;
            //$scope.nullCss  = "defaultShow";
            //
            //$scope.$on('$ionicView.beforeEnter', function () {
            //    $scope.strAgreement = ""
            //    http.get("registerHelpContent", {title:'阿拉善智能监控会员协议'}).success(function (response) {
            //        $scope.content = response.content
            //        if(response.content != null){
            //            $scope.strAgreement=response.content.content
            //        }else{
            //            $scope.nullCss  = "";
            //        }
            //    })
            //});
        }])