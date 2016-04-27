/**
 * Created by cc on 15-8-1.
 */

angular.module('app.services').factory('loginWithCode', ['app.api.http', '$ionicPopup','Storage','ENV','$state', function (http, $ionicPopup,Storage,ENV,$state) {

    var dataJSON = {}

    function login(){
        if(ENV.code){
            http.get('loginWithCode', {code:ENV.code}).success(function (data, status, headers, config) {
                console.log("loginWithCode:回调返回数据:"+JSON.stringify(data))
                if(data.status == 200){
                    openIdLogin(data)
                }
            })
        }
    }


    function openIdLogin(data){
        if(data.user){
            Storage.setUserInfo(data.user);
        }

        if(data.authInfo){
            Storage.setAccessToken(data.authInfo);
        }

        if(data.openId){
            Storage.set("openId",{openId:data.openId})
            dataJSON['openId'] = data.openId
        }

        //自动登陆后,如果在登陆,注册,或忘记密码页面则跳到个人中心
        if(data.user && data.authInfo &&
            ($state.$current.name == 'forgetPass' ||
            $state.$current.name == 'login' ||
            $state.$current.name == 'signup')){
            $state.go('tabs.usercenterMine')
        }

    }

    return {
        login:function(){
            login()
        },
        addOpenId:function(params){
            console.log("addOpenId:"+JSON.stringify(params))
            return angular.extend({openId:dataJSON.openId},params)
        }
    }
}]);