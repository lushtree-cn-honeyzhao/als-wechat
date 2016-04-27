
angular.module('app.services').factory('Storage', ['ENV',function(ENV) {

        var localStorage  = window.localStorage
        window.db = localStorage

        if(ENV.localStorage == 'memory'){
            localStorage = (function(){
                var db = {}
                return {
                    db:function(){
                        return angular.copy(db)
                    },
                    setItem:function(key,value){
                        db[key]=value
                    },
                    getItem:function(key){
                        if(db[key]==undefined){
                            return null
                        }else{
                            return db[key]
                        }
                    },
                    removeItem:function(key){
                        return delete(db[key])
                    }
                }
            })()
        }

        var userKey = 'user'
        var accessToken = 'accessToken'
        var authenticated = false  //是否登陆,保存在内存中

        var keys = []
        function clear(){
            angular.forEach(keys,function(v){
                localStorage.removeItem(v);
            })
            angular.forEach([
                'accessToken','debug','rentCarNewOrderService.selectCarParams','user'
            ],function(v){
                localStorage.removeItem(v);
            })
        }

        return {

            setUserInfo: function(data) {
                return this.set(userKey, data);
            },
            getUserInfo: function() {
                return this.get(userKey);
            },
            setAccessToken: function(data) {
                authenticated = true
                return this.set(accessToken, data);
            },
            getAccessToken: function() {
                return this.get(accessToken);
            },
            set: function(key, data) {
                keys.push(key)
                return localStorage.setItem(key, window.JSON.stringify(data));
            },

            get: function(key) {
                return window.JSON.parse(localStorage.getItem(key));
            },
            remove: function(key) {
                return localStorage.removeItem(key);
            },
            clear: function() {
                clear()
            },
            authenticated:function(){
                return authenticated
            }
        };
    }]);
