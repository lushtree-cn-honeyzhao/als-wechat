'use strict';

angular.module('app.controllers').controller('UserController',
    ['$state', '$scope', '$http', '$location', '$stateParams', 'ENV', '$ionicPopup', 'Storage', 'app.api.http', '$log',
        function ($state, $scope, $http, $location, $stateParams, ENV, $ionicPopup, Storage, http, $log) {

            var loginName = $stateParams.loginname;
            $scope.$on('$ionicView.beforeEnter', function () {
                // load user data
                // $scope.loadUser(true);
                flushUser()
            });

            function flushUser() {
                if (Storage.getUserInfo().approveStatusStr == '审核通过') {
                    $scope.user = Storage.getUserInfo()
                } else {
                    http.get('userGetUserInfo').success(function (data, status, headers, config) {
                        data.user.idImg = http.withAutoCode(data.user.idImg)
                        data.user.driversImg = http.withAutoCode(data.user.driversImg)
                        $scope.user = data.user
                        if (data.user && data.user.approveStatusStr && data.user.approveStatusStr == '待上传证件') {
                            $scope.user.approveStatusStr = '未提交认证'
                        }
                        Storage.setUserInfo(data.user)
                    });
                }
            }

//        $scope.signupUpload=function(){
//            $state.go('signupUpload',{uploadType:'fromMine'})
//        }

            // load user data
            //$scope.loadUser = function (reload) {
            //
            //    $scope.user = Storage.getUserInfo()
            //
            //    //var userResource;
            //    //if (reload === true) {
            //    //  userResource = User.get(loginName);
            //    //} else {
            //    //  userResource = User.getByLoginName(loginName);
            //    //}
            //    //return userResource.$promise.then(function(response) {
            //    //  $scope.user = response.data;
            //    //});
            //};


            $scope.onLogout = function () {
                $log.debug('onLogout');

                http.post('signOut', {isWechat: true}).success(function (data, status, headers, config) {
                    $log.debug('signOut callback');

                    Storage.clear();
                    $state.go('login')

                }).error(function (data, status, headers, config) {

                    $log.debug('signOut callback error');

                    Storage.clear();
                    $state.go('login')
                });
            };
        }])


/**
 *update userinfo
 */
angular.module('app.controllers').controller('UserUpController',
    ['$state', '$scope', '$http', '$location', '$stateParams', 'ENV', '$ionicPopup', 'Storage', 'app.api.http',
        function ($state, $scope, $http, $location, $stateParams, ENV, $ionicPopup, Storage, http) {

            $scope.user = {
                headImgUrl: 'http://wwww.baidu.com', userNickName: 'userNickName', sex: '男',
                userBirthday: '10/25/1982', cityId: '北京市', areaId: '海淀区',
                homeAddress: 'homeAddress',
                emergencyContactUser: 'emergencyContactUser',
                emergencyContactTel: 'emergencyContactTel'
            }

            var loginName = $stateParams.loginname;
            $scope.$on('$ionicView.beforeEnter', function () {
                // load user data
                http.get('userGetUserInfo').success(function (data, status, headers, config) {
                    $scope.user = data.user
                });
                //$scope.loadUser(true);
            });
            $scope.checkCoupons = function () {
                $state.go('coupons')
            }

            // load user data
            $scope.loadUser = function (reload) {


                //$scope.user = Storage.getUserInfo()
            };

            $scope.updUserInfo = function () {
                var paramData = {
                    authcode: Storage.getAccessToken().authcode,
                    userNickName: $scope.user.userNickName,
                    sex: $scope.user.sex,
                    userBirthday: $scope.user.userBirthday,
                    //cityId           : $scope.user.cityId,
                    //areaId           : $scope.user.areaId,
                    homeAddress: $scope.user.homeAddress,
                    emergencyContactUser: $scope.user.emergencyContactUser,
                    emergencyContactTel: $scope.user.emergencyContactTel
                }

                http.post('userUpdUserInfo', paramData).success(function (data, status, headers, config) {
                    if (data.status > 0) {
                        //$ionicPopup.alert({
                        //    title: '提示',
                        //    template: data.message,
                        //    okText: '确定'
                        //})
                        var alertPopup = $ionicPopup.alert({
                            title: '提示',
                            template: data.message
                        });
                        //alertPopup.then(function(res) {
                        //    $state.go('tabs.usercenterMine', {rnd: Math.random() + "_" + new Date().getTime()})
                        //});

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
 * 我的代金券
 */
angular.module('app.controllers').controller('CouponsController',
    ['$scope', 'app.api.http', '$location', '$ionicPopup', 'Storage', '$log',
        function ($scope, http, $location, $ionicPopup, Storage, $log) {
            // $scope.nullCss={css1:"nullItem",css2:"nullItem",css3:"nullItem"}
            $scope.nullCss = {css1: "nullItem"}
            $scope.coupons = [];
            $scope.btn = {ClickCss1: '', ClickCss2: 'button-outline', ClickCss3: 'button-outline'}

            $scope.$on('$ionicView.beforeEnter', function () {
                $scope.useful();
            })

            $scope.useful = function () {
                // $scope.nullCss={css1:"nullItem",css2:"nullItem",css3:"nullItem"}
                $scope.nullCss = {css1: "nullItem"}
                $log.debug('in useful');
                $scope.btn = {ClickCss1: '', ClickCss2: 'button-outline', ClickCss3: 'button-outline'}
                http.get("useful")
                    .success(function (response) {
                        $scope.coupons = []
                        angular.forEach(response.list, function (element) {
                            $scope.coupons.push(element);
                        });

                        if ($scope.coupons.length == 0) {
                            //$scope.nullCss={css1:"",css2:"nullItem",css3:"nullItem"}
                            $scope.nullCss = {css1: ""}
                        }

                    });
            }
            $scope.used = function () {
                //$scope.nullCss={css1:"nullItem",css2:"nullItem",css3:"nullItem"}
                $scope.nullCss = {css1: "nullItem"}
                $scope.btn = {ClickCss1: 'button-outline', ClickCss2: '', ClickCss3: 'button-outline'}
                http.get("used")
                    .success(function (response) {
                        $scope.coupons = []
                        angular.forEach(response.list, function (element) {
                            $scope.coupons.push(element);
                        });
                        if ($scope.coupons.length == 0) {
                            // $scope.nullCss={css1:"nullItem",css2:"",css3:"nullItem"}
                            $scope.nullCss = {css1: ""}
                        }
                    });
            }
            $scope.pastDue = function () {
                //$scope.nullCss={css1:"nullItem",css2:"nullItem",css3:"nullItem"}
                $scope.nullCss = {css1: "nullItem"}
                $scope.btn = {ClickCss1: 'button-outline', ClickCss2: 'button-outline', ClickCss3: ''}
                http.get("pastDue")
                    .success(function (response) {
                        $scope.coupons = []
                        angular.forEach(response.list, function (element) {
                            $scope.coupons.push(element);
                        });
                        if ($scope.coupons.length == 0) {
                            // $scope.nullCss={css1:"nullItem",css2:"nullItem",css3:""}
                            $scope.nullCss = {css1: ""}
                        }
                    });
            }
        }])

/**
 * 帮助中心列表页
 */
angular.module('app.controllers').controller('HelpCenterController', ['$scope', 'app.api.http', '$location', '$ionicPopup', 'Storage', '$stateParams', '$rootScope',
    function ($scope, http, $location, $ionicPopup, Storage, $stateParams, $rootScope) {
        $scope.items = []
        $scope.$on('$ionicView.beforeEnter', function () {
            loadItems();
        })
        function loadItems() {
            $scope.items = []
            http.get("helpCenter").success(function (response) {
                angular.forEach(response.data, function (element) {
                    $scope.items.push(element);
                });
            })
        }
    }])
/**
 * 帮助中心内容页
 */
angular.module('app.controllers').controller('HelpContentController', ['$scope', 'app.api.http', '$location', '$ionicPopup', 'Storage', '$stateParams',
    function ($scope, http, $location, $ionicPopup, Storage, $stateParams) {
        var id = $stateParams.id;
        $scope.$on('$ionicView.beforeEnter', function () {
            $scope.content = null
            $scope.str = ""
            //注意replace的使用
            http.get("helpContent", {id: id}).success(function (response) {
                $scope.content = response.content
                var strs = response.content.content.split("\r\n")
                for (var i = 0; i < strs.length; i++) {
                        $scope.str += strs[i]
                    //if (i != strs.length - 1) {
                    //    $scope.str += "<br>"
                    //}
                }
                $scope.content.lastUpdated = response.content.lastUpdated.split(" ")[0]
            })
        })

    }])
