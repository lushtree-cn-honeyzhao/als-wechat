/**
 * Created by cc on 15-8-4.
 */

angular.module('app.services').factory('orderCommit', function () {

    var car = {
        version:'正在加载',
        name:'正在加载',
        kms:'正在加载',
        pointName:'正在加载',
        pointAddress:'正在加载',
        from:'正在加载'
    }

    return {
        set:function(guideName,guideAddress,kms,vehicleLicense,vehicleVersionName,from){
            car.pointName = guideName
            car.name = vehicleVersionName
            car.pointAddress = guideAddress
            car.kms = kms
            car.version = vehicleLicense
            car.from = from
        },
        get:function(){
            return car
        }
    };




});
