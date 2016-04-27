/**
 * Created by cc on 15-8-6.
 */
/**
 * Created by cc on 15-8-4.
 */

angular.module('app.services').factory('rentService',
    ['app.api.http', 'dateFilter', '$state', '$stateParams', '$ionicPopup', 'rentCarNewOrderService', '$filter','ENV',
        function (http, dateFilter, $state, $stateParams, $ionicPopup, rentCarNewOrderService, $filter,ENV) {

            /**
             * 时间格式化
             * @param date
             * @returns {string}
             */
            function timeFormer(date) {
                return $filter('date')(angular.copy(date), 'yyyy-MM-dd HH点')
            }

            /**
             * 返回初始化的取车还车时间
             *
             白天（8：00-17：00可以预定车辆）
             0-17点展示共享在今天白天的车
             17-24点展示共享在明天白天的车

             包夜（17：00-第二天8点可以预定车辆）
             9：00之后展示今天包夜
             9：00之前展示昨天包夜

             整租（预定时间在8：00-17：00算白天时段，17：00-第二天8点预定车辆算包夜）
             0-17点展示9点以后共享在此时间段的车，
             17-24点展示18点以后共享在此时间段的车

             *
             * @returns {{from: *, to: *}}
             */

            function initTime(type, nowTime) {
                var now = nowTime ? nowTime : new Date(), from = new Date(), to = new Date();
                if (type == 'day') {//白天
                    if (now.getHours() <= 17) { //0-17点
                        from.setHours(9, 0, 0, 0)
                        from.setDate(now.getDate())
                        to.setHours(18, 0, 0, 0)
                        to.setDate(now.getDate())
                    } else { //17-24点
                        from.setHours(9, 0, 0, 0)
                        from.setDate(now.getDate() + 1)
                        to.setHours(18, 0, 0, 0)
                        to.setDate(now.getDate() + 1)
                    }
                } else if (type == 'rentMore') {//整租
                    if (now.getHours() <= 17) { //0-17点
                        from.setHours(9, 0, 0, 0)
                        from.setDate(now.getDate())
                        to.setHours(9, 0, 0, 0)
                        to.setDate(now.getDate() + 1)
                    } else { //17-24点
                        from.setHours(18, 0, 0, 0)
                        from.setDate(now.getDate())
                        to.setHours(18, 0, 0, 0)
                        to.setDate(now.getDate() + 1)
                    }
                } else {//晚间租车
                    if (now.getHours() > 9) {//9-24点
                        from.setHours(18, 0, 0, 0)
                        from.setDate(now.getDate())
                        to.setHours(9, 0, 0, 0)
                        to.setDate(now.getDate() + 1)
                    } else {//0-9点
                        from.setHours(18, 0, 0, 0)
                        from.setDate(now.getDate() - 1)
                        to.setHours(9, 0, 0, 0)
                        to.setDate(now.getDate())
                    }
                }

                return {
                    value: {from: from, to: to},
                    view: {from: timeFormer(from), to: timeFormer(to)}
                }
            }

            /**
             * 对车列表时间参数的限制
             * @param type
             * @param from
             * @param to
             * @returns {*}
             */
            function listChecktime(type, from, to){
                if(from && to && (from.getTime() >= to.getTime())){
                    return {
                        title: '对不起',
                        template: '还车时间应在取车时间之后',
                        okText: '确定'
                    }
                }
                if (type == 'rentMore') {
                    if (from && to && (to.getTime() - from.getTime() < 24 * 60 * 60 * 1000)) {
                        return {
                            title: '对不起',
                            template: '整租必须跨至少两个时间段',
                            okText: '确定'
                        }
                    } else {
                        return true
                    }
                }
            }

            /**
             * 车展示后点车的时间限制
             * @param type
             * @param nowHours
             * @param from
             * @param to
             * @returns {*}
             */
            function checktime(type, nowHours, from, to) {
                if(ENV.debug) return true
                var now = nowHours ? nowHours : new Date().getHours()
                if (type == 'day') {//白天
                    if (now >= 8 && now < 17) {
                        return true
                    } else { //17-24点
                        return {
                            title: '对不起',
                            template: '每天8:00-17:00可以预定白天可租白天时间段车辆',
                            okText: '确定'
                        }
                    }
                } else if (type == 'night') {//晚间租车
                    if (now >= 17 && now < 20 ) {
                        return true
                    } else {
                        return {
                            title: '对不起',
                            template: '每天17:00-20:00可以预定夜间时段车辆',
                            okText: '确定'
                        }
                    }
                } else if (type == 'rentMore') {
                    if (from && to && (to.getTime() - from.getTime() < 24 * 60 * 60 * 1000)) {
                        return {
                            title: '对不起',
                            template: '整租必须少一个白天和晚上',
                            okText: '确定'
                        }
                    } else {
                        return true
                    }
                }

            }

            //todo 测试,待注释
            /**
            (function timeTest() {
                for (var i = 0; i < 24; i++) {
                    var now = new Date()
                    now.setHours(i, 0, 0, 0)
                    var result = initTime('day', now)
                    console.log('白天租车:[' + i + '点]' + '列表查询时间[' + result.view.from + ',--->' + result.view.to + ',' + (checktime('day', i) == true ? '可租' : '不可租'))
                }
                console.log('===============================')
                for (var i = 0; i < 24; i++) {
                    var now = new Date()
                    now.setHours(i, 0, 0, 0)
                    var result = initTime('night', now)
                    console.log('晚上租车:[' + i + '点]' + '列表查询时间[' + result.view.from + ',--->' + result.view.to + ',' + (checktime('night', i) == true ? '可租' : '不可租'))
                }
                console.log('===============================')
                for (var i = 0; i < 24; i++) {
                    var now = new Date()
                    now.setHours(i, 0, 0, 0)
                    var result = initTime('rentMore', now)
                    console.log('整租:[' + i + '点]' + '列表查询时间[' + result.view.from + ',--->' + result.view.to)
                }
            })()
            **/

            //获得北京所有网点列表
            function findGuideList(fn) {
                http.get("findGuideList", {
                    type: 'rentCar',
                    cityName: '北京'
                }).success(function (data, status, headers, config) {
                    if (status > 0) {
                        fn(data)
                    } else if (status <= 0) {
                        console.log(data)
                    }
                });
            }

            //从已有的车列表中选出不同品牌
            function getBrands(list) {
                var temp = {}
                var result = []
                angular.forEach(list, function (v) {
                    if (this[v.brand + ''] === undefined) {
                        this[v.brand + ''] = true
                        //result.push({brand: v.brand, all: false})
                        result.push({brand: v.vehicleVersionName, all: false})
                        //result.push({brand: v.brand, all: false})
                    }
                }, temp)
                return result
            }

            //通过参数取车列表
            function carsList(fetchSite, startDate, endDate, callback, finalFn) {
                http.get("activeCarList", {
                    fetchSite: fetchSite,
                    startDate: startDate,
                    endDate: endDate,
                    vehVerId: ''
                }).success(function (data, status, headers, config) {
                    if (status > 0) {
                        if (angular.isFunction(callback)) callback(data)
                    } else if (status <= 0) {
                        console.log(data)
                    }
                }).finally(function () {
                    if (angular.isFunction(finalFn)) finalFn()
                });
            }

            function getUserPackageState(fn) {
                http.get("package_checkUserPackageState", {})
                    .success(function (data, status, headers, config) {
                        fn(data)
                    })
            }


            return {
                initTime: function (type) {
                    return initTime(type)
                },
                checktime: function (type, from, to) {
                    return checktime(type, null, from, to)
                },
                listChecktime: function (type, from, to) {
                    return listChecktime(type, from, to)
                },
                timeFormer: function (date) {
                    return timeFormer(date)
                },
                findGuideList: function (fn) {
                    findGuideList(fn)
                },
                getBrands: function (list) {
                    return getBrands(list)
                },
                getCarsList: function (fetchSite, startDate, endDate, callback, finalFn) {
                    carsList(fetchSite, startDate, endDate, callback, finalFn)
                },
                getUserPackageState: function (callback) {
                    getUserPackageState(callback);
                }

            };


        }]);
