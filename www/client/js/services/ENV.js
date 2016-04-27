/**
 * Created by cc on 15-8-1.
 */

angular.module('app.config').provider('ENV', [ function config() {

    //默认值
    var env = {
        api: '/ev-manager/',
        //http://ev-easy.com/ev-manager/wechat/test/?debug=true&clientId=cc&api=http://ev-easy.com/ev-manager/wechat/test/ev-manager/
        callCenterTel: '400-8838-026',
        debug: false
    }

    function params() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = (strs[i].split("=")[1]);
            }
        }
        console.log('theRequest:'+JSON.stringify(theRequest))
        return theRequest;
    }
    //用url中的值覆盖默认值
    env = angular.extend(env,params())

    this.$get = ['$window', function config($window) {
        console.log('ENV:'+JSON.stringify(env))
        return env
    }];

}]);