/**
 * Created by cc on 15-7-25.
 */

angular.module('app.services').factory('app.api.http',
    ['$http','Storage','$state','$rootScope','$ionicLoading','$ionicPopup','$log','ENV',
    function ($http,Storage,$state,$rootScope,$ionicLoading,$ionicPopup, $log, ENV) {
    var api = {
        //返回城市列表
        cityList: {
            url:'sysCity/cityList.json',
            method:'GET'
        },
        //返回网店列表
        findGuideList:{
            url:'guideStore/findGuideList.json'
        },
        //获取网点可租车型列表
        activeCarList:{
            url:'vehicleInfo/findActiveCarList.json'
        },
        useful:{
            url:'coupon/useful.json',
            authCode:true
        },
        used:{
            url:'coupon/used.json',
            authCode:true
        },
        pastDue:{
            url:'coupon/pastDue.json',
            authCode:true
        },
        signOut:{
            url:'auth/signOut.json',
            authCode:true
        },
        signIn:{
            //url:'auth/signIn.json'
            url:'wechatAuth/signIn'
        },
        register:{
            url:'wechatAuth/register'
        },
        updatePass:{
            url:'evcarUser/updatePass.json',
            authCode:true
        },
        sendPasswordValidCode:{
            url:'vaildCode/sendPasswordValidCode'
        },
        resetPassword:{
            url:'evcarUser/resetPassword'
        },
        sendRegVaildCode:{
            url:'vaildCode/sendRegVaildCode'
        },
        currentUserMessage:{
            url:'userMessage/currentUserMessage.json',
            authCode:true
        },
        //先订单预览，后下订单
        perOrder:{
            url:'perRent/perOrder.json',
            authCode:true
        },
        createPerRent:{
            url:'perRent/createPerRent.json',
            authCode:true
        },
        userCouponList:{
            url:'coupon/userCouponList.json',
            authCode:true
        },
        payment:{
            url:'account/payment.json',
            authCode:true
        },
        showPerRent:{
            url:'perRent/showPerRent.json',
            authCode:true
        },
        reviewPerRent:{
            url:'perRent/reviewPerRent.json',
            authCode:true
        },
        //currentUserMessage:{
        //    url:'userMessage/currentUserMessage.json',
        //    authCode:true
        //},
        h5Pay:{
            url:'wxpay/h5Pay',
            authCode:true
        },
        loginWithCode:{
            url:'wechatAuth/loginWithCode'
        },
        paymentPerRent:{
            url:'perRent/paymentPerRent.json',
            authCode:true,
            method:'POST'
        },
        buyPackage:{
            url:'productPackage/packageList.json',
            authCode:true
        },
        packageDetails:{
            url:'productPackage/packageDetails',
            authCode:true
        },
        userCoupon:{
            url:'userCoupon/show2.json',
            authCode:true
        },
        createUserPackage:{
            url:'productPackage/createUserPackage',
            authCode:true
        },
        paymentUserPackage:{
            url:'productPackage/paymentUserPackage',
            authCode:true
        },
        userProductPackageList:{
            url:'productUserPackage/userProductPackageList.json',
            authCode:true
        },
        userPackageItem:{
            url:'productUserPackage/userPackageItem.json?',
            authCode:true
        },
        enablePackage:{
            url:'productPackage/enablePackage',
            authCode:true
        },
        package_checkUserPackageState:{
            url:'productUserPackage/checkUserPackageState.json',
            authCode:true
        },
        saveEvcarUser:{
            url:'evcarUser/saveEvcarUser',
            authCode:true
        },
        userUpdUserInfo:{
            url:'evcarUser/updUserInfo',
            authCode:true
        },
        userGetUserInfo:{
            url:'evcarUser/userInfo.json',
            authCode:true
        },
        getSignature:{
            url:'wxJs/getSignature.json',
            authCode:true
        },
        downloadPhoto:{
            url:'wxJs/downloadPhoto.json',
            authCode:true
        },
        savedriversLicense:{
            url:'evcarUser/savedriversLicense.json',
            authCode:true
        },
        flushUser:{
            url:'wxJs/flushUser.json',
            authCode:true
        },
        createPaymentOrder:{
            url:'account/createPaymentOrder.json',
            authCode:true
        },
        beforePerRent:{
            url:'perRent/beforePerRent.json',
            authCode:true
        },
        helpCenter:{
            url:'ezCmsContent/helpContentlist.json',
            authCode:true
        },
        helpContent:{
            url:'ezCmsContent/showContent.json',
            authCode:true
        },
        registerHelpContent:{
            url:'ezCmsContent/getContentByTitle.json',
            authCode:false
        }


    }


    function logincheck(apiObj){
        if(apiObj.authCode===undefined || apiObj.authCode===false){
            return false
        }
        if(apiObj.authCode===true){
            if(Storage.getAccessToken()==null) {
                $state.go('login')
            }else{
                return true
            }
        }
    }

    function http(apiName, param,method){
        if (!api[apiName]) {
            console.error("找不到api")
            return
        }
        var is = logincheck(api[apiName])

        var paramData = angular.extend(//参数合并
            param?param:{},
            {isAjax:true,rnd:Math.random() +"_"+ new Date().getTime()},
            api[apiName].params,
            is?{authcode:Storage.getAccessToken().authcode}:{}
        )

        var requestUrl = ENV.api + api[apiName].url;

        var method = api[apiName].method?(api[apiName].method):(method?method:'GET');

        if(ENV.debug){
            $log.debug("["+method+"]:" + api[apiName].url);
            $log.debug("[Params]:" + angular.toJson(paramData));
        }
        $ionicLoading.show()
        return $http({
            method: method,
            url:    requestUrl,
            params: paramData
        })
        .success(function (data, status, headers, config) {
                $ionicLoading.hide()
                if(ENV.debug){
                    $log.debug("status:"+status);
                    $log.debug(JSON.stringify(data));
                }
                if(angular.isFunction(api[apiName].success)){
                    api[apiName].success(data, status, headers, config)
                }else{
                    if(data.status == -20001){
                        //{"status":-20001, "message":"需要登录的请求。"}
                        console.log(JSON.stringify(data))
                        console.log(requestUrl)
                        Storage.clear()
                        $state.go('login')
                        return false;
                    }

                    if(data.status == -20002){
                        //{"status":-20002, "message":"没有访问该页面的权限！"}
                        var str = '系统错误：' + data.message;
                        console.log(str);
                        $ionicPopup.alert({
                            title: str,
                            template: '['+method+']['+requestUrl+']<br>'+status+']',
                            okText: '确定'
                        })
                        return false;
                    }
                }
        })
        .error(function (data, status, headers, config) {
                $ionicLoading.hide()
                $log.error(requestUrl)
                if(ENV.debug){
                    $ionicPopup.alert({
                        title: '['+method+']['+requestUrl+']<br>'+status+']',
                        template: '['+JSON.stringify(paramData)+']<br>['+JSON.stringify(data)+']<br>',
                        okText: '确定'
                    }).then(function () {
                        $state.go('tabs.home')
                    });
                    return false;
                }
        })

    }

    return {
        get: function (apiName, paramData) {
            return http(apiName, paramData,'GET')
        },
        post: function (apiName, paramData) {
            return http(apiName, paramData,'POST')
        },
        //使用url配置中的method属性选中发送get或post请求
        api:function(apiName, paramData){
            return http(apiName, paramData)
        },
        //ajax with autocode
        withAutoCode:function(params){
            if(angular.isString(params)){
                if(params.search('/?/')==-1){
                    return params+'?authcode='+Storage.getAccessToken().authcode
                }else{
                    return params+'&authcode='+Storage.getAccessToken().authcode
                }
            }else if(angular.isObject(params)){
                return angular.extend(params,{authcode:Storage.getAccessToken().authcode})
            }else{
                return params
            }
        }
    }

}])
