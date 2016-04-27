/**
 * Created by cc on 15-8-1.
 */

angular.module('app.config').provider('config', ['$httpProvider', function config($httpProvider) {

    //$provide.decorator('$state', function($delegate, $stateParams) {
    //    $delegate.forceReload = function() {
    //        return $delegate.go($delegate.current, $stateParams, {
    //            reload: true,
    //            inherit: false,
    //            notify: true
    //        });
    //    };
    //    return $delegate;
    //});


    $httpProvider.interceptors.push(['$rootScope', function ($rootScope) {
        return {
            //request: function (config) {
            //    $rootScope.$broadcast('loading:show')
            //    console.log('--------------->'+JSON.stringify(config))
            //    return config
            //},
            //response: function (response) {
            //    $rootScope.$broadcast('loading:hide')
            //    return response
            //}
        }
    }])

    this.$get = ['$httpProvider', function config($httpProvider) {
        return {}
    }];
}]);


angular.module('app.config').provider('run', [function () {

    this.$get = ['$state', '$rootScope', 'Storage', '$ionicLoading','log','ENV','loginWithCode',
        function config($state, $rootScope, Storage, $ionicLoading,log,ENV,loginWithCode) {

            //angluar初始化后使用腾讯回调登陆
            loginWithCode.login();

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

                //拦截需要登陆,但没有登陆的页面跳转
                //url中没有配置authCode,url配置authCode,且为false, 不拦截
                if (toState.authCode == null){

                } else if(toState.authCode == false) {

                } else {//toState.authCode == true
                    if (Storage.getAccessToken() == null) {
                        event.preventDefault();
                        $state.go('login')
                        return
                    }
                }

            })
            //http时的菊花
            //$rootScope.$on('loading:show', function () {
            //    $ionicLoading.show()
            //})
            //$rootScope.$on('loading:hide', function () {
            //    $ionicLoading.hide()
            //})

            var alerts =[]
            //$ionicPopup.alert = (function(fn){
            //    return function(){
            //        alerts.push(fn.apply($ionicPopup.alert,arguments));
            //    }
            //})($ionicPopup.alert)

            //切换时隐藏弹出层
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                $ionicLoading.hide()
                angular.forEach(alerts,function(v,i){
                    v.close()
                    //alerts.splice(i,1)
                })
            })
            return {}
        }];


}])





