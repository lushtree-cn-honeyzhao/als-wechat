angular.module('app.controllers')
    .controller('AppController', ['$scope','app.api.http','$location','$ionicPopup','Storage','loginWithCode','$state','$rootScope',
        function($scope, http, $location,$ionicPopup, Storage,loginWithCode, $state, $rootScope) {
            $scope.logon = {name:'', password:'', isAjax:'true'};

            $scope.user = {mobile:'9941'}

            $scope.goForgotPassword = function() {
                //$state.go('forgetPass');
                $rootScope.go_url('forgetPass');
                return false;
            }
            $scope.goSignup = function() {
                //$state.go('signup');
                $rootScope.go_url('signup');
                return false;
            }
            $scope.onLogin = function() {

                if($scope.logon.username == '' || $scope.logon.password == ''){
                    $ionicPopup.alert({
                        title:'提示',
                        template:'请输入用户名和密码!',
                        okText:'确定'
                    })
                    return false;
                }

                var paramData = {
                    username:$scope.logon.username,
                    password:$scope.logon.password,
                    isAjax:$scope.logon.isAjax
                }
                var param = loginWithCode.addOpenId(paramData)
                console.log('登录:'+JSON.stringify(param))
                http.post('signIn',param).success(function(data, status, headers, config) {
                    if(data.status > 0){
                        var user = data.user;
                        Storage.setUserInfo(user);
                        Storage.setAccessToken(data.authInfo);
                        $scope.user = user
                        //$location.path('/');
                        $rootScope.go_url('tabs.home');
                    } else if (data.status <= 0) {
                        $ionicPopup.alert({
                            title:'提示',
                            template:data.message,
                            okText:'确定'
                        });
                        return false;
                    }
                })

            };


        }])