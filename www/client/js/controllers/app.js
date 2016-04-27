'use strict';


/**
 * 修改密码
 */
angular.module('app.controllers').controller('UpdatePassController',
    ['$scope', 'app.api.http', '$location', '$ionicPopup','$state',
        function ($scope, http, $location, $ionicPopup,$state) {
            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.pwd = {password: '', newpassword: '', repass: ''};
            });
           // $scope.pwd = {password: '', newpassword: '', repass: ''};
            $scope.updatePwd = function () {

                if ($scope.pwd.password == '' || $scope.pwd.newpassword == '' || $scope.pwd.repass == '') {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '请输入密码并确认密码!',
                        okText: '确定'
                    })
                    return;
                }
                if ($scope.pwd.newpassword != $scope.pwd.repass) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '两次密码输入不同，请重新输入!',
                        okText: '确定'
                    })
                    return;
                }
                //var updateUrl = ENV.api + 'evcarUser/updatePass.json';
                var paramData = {
                    password: $scope.pwd.password,
                    newpassword: $scope.pwd.newpassword
                }
                //$http(
                //    {
                //        method: 'POST',
                //        url: updateUrl,
                //        params: paramData
                //    }
                http.post("updatePass", paramData
                ).success(function (data, status, headers, config) {
                        if(data.status == -5){
                            data.message='密码过于简单'
                        }
                        if (data.status > 0) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: data.message,
                                okText: '确定'
                            }).then(function(){
                                $state.go('tabs.usercenterMine', {rnd:Math.random() +"_"+ new Date().getTime()})})
                        } else if (data.status <= 0) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: data.message,
                                okText: '确定'
                            })
                        }
                    }).error(function (data, status, headers, config) {
                        alert('发生系统错误.');
                    });
            }
        }])

/**
 * 忘记密码
 */
angular.module('app.controllers').controller('ForgetPassController',
    ['$scope', 'app.api.http', '$location', '$ionicPopup', '$timeout',
        function ($scope, http, $location, $ionicPopup, $timeout) {
            $scope.timer = '点击获取验证码';
            $scope.buttonFlag=''
            $scope.fpwd = {phoneNum: '', vaildCode: '', userPassword: '', rePassword: ''};
            $scope.getValidCode = function () {
                if ($scope.fpwd.phoneNum == '') {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '请输入手机号!',
                        okText: '确定'
                    })
                    return;
                }
                var paramData = {
                    phoneNum: $scope.fpwd.phoneNum
                }
                http.post("sendPasswordValidCode", paramData
                ).success(function (data, status, headers, config) {
                        if (data.status > 0) {
                            $scope.buttonFlag='disabled'
                            $ionicPopup.alert({
                                title: '提示',
                                template: data.message,
                                okText: '确定'
                            })
                            var updateClock = function (t) {
                                if (t >= 0) {
                                    $timeout(function () {
                                        if(t>0){
                                        $scope.timer = t + '秒后，重新获取'}
                                        else{
                                            $scope.buttonFlag=''
                                            $scope.timer = '点击获取验证码';
                                        }
                                        updateClock(t - 1)
                                    }, 1000);
                                }
                            }
                            updateClock(60);
                            //$location.path('/');
                        } else if (data.status <= 0) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: data.message,
                                okText: '确定'
                            })
                        }
                    }).error(function (data, status, headers, config) {
                        alert('发生系统错误.');
                    });
            }
            $scope.resetPwd = function () {

                if ($scope.fpwd.vaildCode == '' || $scope.fpwd.userPassword == '' || $scope.fpwd.rePassword == '') {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '请输入密码并确认密码!',
                        okText: '确定'
                    })
                    return;
                }
                if ($scope.fpwd.userPassword != $scope.fpwd.rePassword) {
                    $ionicPopup.alert({
                        title: '提示',
                        template: '两次密码输入不同，请重新输入!',
                        okText: '确定'
                    })
                    return;
                }
                //var resetUrl = ENV.api + 'evcarUser/resetPassword';
                var paramData = {
                    phoneNum: $scope.fpwd.phoneNum,
                    vaildCode: $scope.fpwd.vaildCode,
                    userPassword: $scope.fpwd.userPassword
                }
                //$http(
                //    {
                //        method: 'POST',
                //        url: resetUrl,
                //        params: paramData
                //    }
                http.post("resetPassword", paramData
                ).success(function (data, status, headers, config) {
                        if (data.status > 0) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: data.message,
                                okText: '确定'
                            })
                            //$location.path('/');
                        } else if (data.status <= 0) {
                            $ionicPopup.alert({
                                title: '提示',
                                template: data.message,
                                okText: '确定'
                            })
                        }
                    }).error(function (data, status, headers, config) {
                        alert('发生系统错误.');
                    });
            }
        }])

angular.module('app.controllers').controller('DatepickerDefultController', ['$scope', '$ionicModal', 'dateFilter', function ($scope, $ionicModal, dateFilter) {

    $scope.timeParameter = '';
    $ionicModal.fromTemplateUrl('tep/common/dateModalDefult.html', function (modal) {
            $scope.datemodal = modal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        }
    );
    function timeConf(time, modal) {
        var date = modal == undefined ? dateFilter(new Date(), 'yyyy-MM-dd') : modal
        return {
            value: date + " " + time
        }
    }

    $scope.opendateModal = function (timeParameter) {
        $scope.datemodal.show();
        //表单input参数名称全局赋值
        $scope.timeParameter = timeParameter
    };
    $scope.closedateModal = function (modal) {
        $scope.datemodal.hide();
        //alert("=="+$scope.timeParameter  )
        $scope.user.userBirthday = modal;
    };


}]);

angular.module('app.controllers').controller('DatepickerController', ['$scope', '$ionicModal', 'dateFilter', function ($scope, $ionicModal, dateFilter) {

    $ionicModal.fromTemplateUrl('tep/common/dateModal.html', function (modal) {
            $scope.datemodal = modal;
        }, {
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        }
    );
    function timeConf(time, modal) {
        var date = modal == undefined ? dateFilter(new Date(), 'yyyy-MM-dd') : modal
        return {
            value: date + " " + time,
            view: date + " " + (time == '09:00:00' ? '上午09点' : '下午18点')
        }
    }

    function timeInit(date) {
        return dateFilter(date, 'yyyy-MM-dd') + " " + (dateFilter(date, 'hh:mm:ss') == '09:00:00' ? '上午09点' : '下午18点')
    }

    $scope.fromView = timeInit($scope.model.time.from);
    $scope.toView = timeInit($scope.model.time.to);

    var isTo = true;

    $scope.setFromModal = function () {
        $scope.datemodal.show();
        isTo = false
    };

    $scope.setToModal = function () {
        $scope.datemodal.show();
        isTo = true
    };

    $scope.closedateModal = function (modal, time) {
        var time = timeConf(time, modal)
        $scope.datemodal.hide();
        if (isTo) {
            $scope.toView = time.view;
            $scope.model.time.to = time.value;
        } else {
            $scope.fromView = time.view;
            $scope.model.time.from = time.value;
        }
    }
}])


//angular.module('app.controllers').controller('LoadingCtrl', function($scope, $ionicLoading) {
//    $scope.show = function() {
//        $ionicLoading.show({
//            template: 'Loading...'
//        });
//    };
//    $scope.hide = function(){
//        $ionicLoading.hide();
//    };
//});
