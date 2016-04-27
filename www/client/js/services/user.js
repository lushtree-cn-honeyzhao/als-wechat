'use strict';

angular.module('app.services')
    .factory('User', function(ENV, $log, $q, $http, Storage) {
    var storageKey = 'user';
    //var resource = $resource(ENV.api + '/accesstoken');
    //var userResource = $resource(ENV.api + '/user/:loginname', {
    //  loginname: ''
    //});
    var user = Storage.get(storageKey) || {};
    return {
        login: function(logon) {
            var $this = this;
            //return resource.save({
            //  accesstoken: accesstoken
            //}, null, function(response) {
            //  $log.debug('post accesstoken:', response);
            //  user.accesstoken = accesstoken;
            //  $this.getByLoginName(response.loginname).$promise.then(function(r) {
            //    user = r.data;
            //    user.id = response.id;
            //    user.accesstoken = accesstoken;
            //
            //    // set alias for jpush
            //    //Push.setAlias(user.id);
            //
            //    Storage.set(storageKey, user);
            //  });
            //  user.loginname = response.loginname;
            //});
            alert('1');

            if(logon.username == '' || logon.password == ''){
                $ionicPopup.alert({
                    title:'提示',
                    template:'请输入用户名和密码!',
                    okText:'确定'
                })
                return;
            }

            var loginUrl = ENV.api + '/auth/signIn.json';

            var paramData = {
                username:logon.username,
                password:logon.password,
                isAjax:logon.isAjax
            }

            $http(
                {
                    method:'POST',
                    url:loginUrl,
                    params:paramData
                }
            ).success(function(data, status, headers, config) {
                    if(data.status > 0){
                        alert(data.authInfo.authcode);

                        $location.path('/');
                    } else if (data.status <= 0) {
                        //alert(data.message);
                        $ionicPopup.alert({
                            title:'提示',
                            template:'用户名或密码错误!',
                            okText:'确定'
                        })

                    }
                }).error(function (data,status,headers,config){
                    alert('发生系统错误.');
                });
        },
        logout: function() {
            user = {};
            Storage.remove(storageKey);

            // unset alias for jpush
            //Push.setAlias('');
        },
        getCurrentUser: function() {
            $log.debug('current user:', user);
            return user;
        }
    };
});
