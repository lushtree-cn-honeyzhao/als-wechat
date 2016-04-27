'use strict';

angular.module('app.controllers', ['app.services', 'pickadate']);
angular.module('app.services', []);
angular.module('app.filters', ['app.services']);
angular.module('app.directives', []);
angular.module('app.config', ['app.services']);
angular.module('app', [
    'ionic',
    'app.controllers',
    'app.services',
    'app.filters',
    'app.directives',
    'app.config',
    'partials'
]).config(['configProvider', 'routerProvider','ENVProvider', function (config, router,ENV) {
    //初始配置
}]).run(['run', '$rootScope', 'ez_state', function (run,$rootScope, ez_state) {
    $rootScope._USER = {idImg:'',driversImg:'',headImg:''}
    $rootScope._APP_NAME = '阿拉善智能监控';
    /*
    * 页面跳转的方法
     */
    $rootScope.go_url = function (to, params, options) {
        ez_state.go_without_cache(to, params, options);
    }
    //初始运行
}])
//constant ENV 代码移到了www/js/services/ENV.js中




