/**
 * Created by cc on 15-8-1.
 */

angular.module('app.services').service('log', ['ENV','$log',function (ENV,$log) {

    var clientId = new Date().getTime()

    if (ENV.clientId && angular.isFunction(window['io'])) {

        //debug模式开启远程日志功能
        //var e = document.createElement("script")
        //e.setAttribute("src", "js/log/socket.io.js")
        //document.getElementsByTagName("body")[0].appendChild(e)

        window.socket = io('http://ev-easy.com/')
        clientId = ENV.clientId
        if(!window.socket._addUser){
            window.socket.emit('add sender', clientId);
            window.socket._addUser = true
        }

        var logSender = function (type,msg) {
            window.socket.emit('message', {clientId: clientId, msg: {type:type,msg:msg}});
        }


        //window.console.log = function(){logSender('log',arguments)}
        //window.console.warn = function(){logSender('warn',arguments)}
        //window.console.debug = function(){logSender('debug',arguments)}
        //window.console.info = function(){logSender('info',arguments)}
        //window.console.error = function(){logSender('error',arguments)}
        //window.console.trace = function(){logSender('trace',arguments)}

        //console overWrite
        angular.forEach(['log','warn','debug','info','error','trace'],function(v){
            window.console[v] = (function(fn){
                return function(){
                    fn.apply(window.console,arguments);
                    logSender(v,arguments)
                }})(window.console[v]);
        })

        //$log overWrite
        angular.forEach(['log','info','warn','error','debug'],function(v){
            $log[v] = (function(fn){
                return function(){
                    fn.apply($log,arguments);
                    logSender(v,arguments)
                }})($log[v]);
        })


    }

    return {}
}]);